# ECommerce Design Suite Local Runner for Windows
# Run this script in PowerShell to launch the different parts of the monorepo.

Clear-Host
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     ECommerce Design Suite Local Runner     " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Set default ports
$apiPort = "5000"
$shopPort = "3000"
$sandboxPort = "4000"

# Check for .env file or local config
$dotEnvPath = "$PSScriptRoot\.env"
$dbUrl = "postgres://postgres:postgres@localhost:5432/ecommerce"

if (Test-Path $dotEnvPath) {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Gray
    Get-Content $dotEnvPath | ForEach-Object {
        if ($_ -match "^(?<key>[^#=]+)=(?<val>.*)$") {
            $key = $Matches.key.Trim()
            $val = $Matches.val.Trim()
            if ($key -eq "DATABASE_URL") {
                $dbUrl = $val
            }
        }
    }
}

function Show-DbDiagnostics {
    param(
        [string]$ConnectionString
    )

    try {
        $uri = [System.Uri]$ConnectionString
        $hostName = $uri.Host
        $port = $uri.Port
        $dbName = $uri.AbsolutePath.TrimStart('/')

        Write-Host "DB target: host=$hostName port=$port db=$dbName" -ForegroundColor Gray

        if ($hostName -like "*.supabase.co" -and $port -eq 5432) {
            Write-Host "Hint: Supabase direct DB port (5432) may be blocked on some networks." -ForegroundColor Yellow
            Write-Host "Hint: Use Supabase Pooler connection string (usually port 6543)." -ForegroundColor Yellow
        }

        if ($ConnectionString -notmatch "sslmode=") {
            Write-Host "Hint: Add sslmode=require to DATABASE_URL for Supabase." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Could not parse DATABASE_URL. Verify it is a valid Postgres URL." -ForegroundColor Yellow
    }

    Write-Host 'Quick test: pnpm --filter @workspace/db run push -- --url "<POOLER_DATABASE_URL>"' -ForegroundColor Gray
}

function Show-Menu {
    Write-Host ""
    Write-Host "Please select an option:" -ForegroundColor Yellow
    Write-Host "1) Start Express API Server (Watch Mode, Port $apiPort)"
    Write-Host "2) Start ShopNow React Storefront (Port $shopPort)"
    Write-Host "3) Start Mockup Sandbox (Port $sandboxPort)"
    Write-Host "4) Run Database Schema Push (requires DATABASE_URL)"
    Write-Host "5) Run Database Seeding (populates sample products)"
    Write-Host "6) Run OpenAPI Codegen (regenerate types & hooks)"
    Write-Host ""
    Write-Host "--- Build ---" -ForegroundColor Cyan
    Write-Host "7) Build & Run API Server (Production)"
    Write-Host "8) Build & Serve ShopNow Storefront (Production)"
    Write-Host "9) Build & Serve Mockup Sandbox (Production)"
    Write-Host "10) Build All (build only)"
    Write-Host ""
    Write-Host "--- Database Setup ---" -ForegroundColor Cyan
    Write-Host "11) Initialize Database (schema + seed)"
    Write-Host ""
    Write-Host "12) Exit"
    Write-Host ""
}

do {
    Show-Menu
    $choice = Read-Host "Enter option [1-12]"
    
    switch ($choice) {
        "1" {
            Write-Host "Starting Express API Server in watch mode..." -ForegroundColor Green
            $env:PORT = $apiPort
            $env:NODE_ENV = "development"
            
            # Prompt for DB Url if not set or default
            $userInputDb = Read-Host "Enter DATABASE_URL [Default: $dbUrl]"
            if ($userInputDb) { $dbUrl = $userInputDb }
            $env:DATABASE_URL = $dbUrl
            
            Write-Host "Starting on http://localhost:$apiPort and restarting after API source changes..." -ForegroundColor Gray
            npx pnpm --filter @workspace/api-server run dev
            break
        }
        "2" {
            Write-Host "Starting ShopNow React Storefront..." -ForegroundColor Green
            $env:PORT = $shopPort
            $env:BASE_PATH = "/"
            Write-Host "Running on http://localhost:$shopPort" -ForegroundColor Gray
            npx pnpm --filter @workspace/shopnow dev
            break
        }
        "3" {
            Write-Host "Starting Mockup Sandbox..." -ForegroundColor Green
            $env:PORT = $sandboxPort
            $env:BASE_PATH = "/"
            Write-Host "Running on http://localhost:$sandboxPort" -ForegroundColor Gray
            npx pnpm --filter @workspace/mockup-sandbox dev
            break
        }
        "4" {
            Write-Host "Running Database Schema Push..." -ForegroundColor Green
            $userInputDb = Read-Host "Enter DATABASE_URL [Default: $dbUrl]"
            if ($userInputDb) { $dbUrl = $userInputDb }
            $env:DATABASE_URL = $dbUrl
            
            npx pnpm --filter @workspace/db run push
            if ($LASTEXITCODE -ne 0) {
                Write-Host "✗ Schema push failed. Check your database connection." -ForegroundColor Red
                Show-DbDiagnostics -ConnectionString $dbUrl
            } else {
                Write-Host "✓ Schema push completed successfully." -ForegroundColor Green
            }
            break
        }
        "5" {
            Write-Host "Running Database Seeding..." -ForegroundColor Green
            $userInputDb = Read-Host "Enter DATABASE_URL [Default: $dbUrl]"
            if ($userInputDb) { $dbUrl = $userInputDb }
            $env:DATABASE_URL = $dbUrl
            
            npx pnpm --filter @workspace/db run seed
            break
        }
        "6" {
            Write-Host "Running Orval Codegen..." -ForegroundColor Green
            npx pnpm --filter @workspace/api-spec run codegen
            break
        }
        "7" {
            Write-Host "Building & Running API Server (Production)..." -ForegroundColor Green
            $env:NODE_ENV = "production"
            $userInputDb = Read-Host "Enter DATABASE_URL [Default: $dbUrl]"
            if ($userInputDb) { $dbUrl = $userInputDb }
            $env:DATABASE_URL = $dbUrl

            npx pnpm --filter @workspace/api-server run build
            Write-Host "Build complete. Starting server on http://localhost:$apiPort ..." -ForegroundColor Gray
            $env:PORT = $apiPort
            npx pnpm --filter @workspace/api-server run start
            break
        }
        "8" {
            Write-Host "Building & Serving ShopNow Storefront (Production)..." -ForegroundColor Green
            npx pnpm --filter @workspace/shopnow run build
            Write-Host "Build complete. Serving preview on http://localhost:$shopPort ..." -ForegroundColor Gray
            npx pnpm --filter @workspace/shopnow run serve
            break
        }
        "9" {
            Write-Host "Building & Serving Mockup Sandbox (Production)..." -ForegroundColor Green
            npx pnpm --filter @workspace/mockup-sandbox run build
            Write-Host "Build complete. Serving preview on http://localhost:$sandboxPort ..." -ForegroundColor Gray
            npx pnpm --filter @workspace/mockup-sandbox run preview
            break
        }
        "10" {
            Write-Host "Building all projects..." -ForegroundColor Green
            Write-Host "  [1/3] API Server..." -ForegroundColor Gray
            npx pnpm --filter @workspace/api-server run build
            Write-Host "  [2/3] ShopNow Storefront..." -ForegroundColor Gray
            npx pnpm --filter @workspace/shopnow run build
            Write-Host "  [3/3] Mockup Sandbox..." -ForegroundColor Gray
            npx pnpm --filter @workspace/mockup-sandbox run build
            Write-Host "All builds complete!" -ForegroundColor Green
            break
        }
        "11" {
            Write-Host "Initializing Database (Schema + Seed)..." -ForegroundColor Green
            $userInputDb = Read-Host "Enter DATABASE_URL [Default: $dbUrl]"
            if ($userInputDb) { $dbUrl = $userInputDb }
            $env:DATABASE_URL = $dbUrl
            
            Write-Host "Step 1/2: Pushing schema to database..." -ForegroundColor Yellow
            npx pnpm --filter @workspace/db run push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Step 2/2: Seeding database with sample data..." -ForegroundColor Yellow
                npx pnpm --filter @workspace/db run seed
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Database initialization complete!" -ForegroundColor Green
                } else {
                    Write-Host "✗ Seeding failed. Check your database connection." -ForegroundColor Red
                    Show-DbDiagnostics -ConnectionString $dbUrl
                }
            } else {
                Write-Host "✗ Schema push failed. Check your database connection." -ForegroundColor Red
                Show-DbDiagnostics -ConnectionString $dbUrl
            }
            break
        }
        "12" {
            Write-Host "Exiting. Goodbye!" -ForegroundColor Gray
            exit
        }
        default {
            Write-Host "Invalid choice. Please enter a number between 1 and 11." -ForegroundColor Red
        }
    }
} while ($true)
