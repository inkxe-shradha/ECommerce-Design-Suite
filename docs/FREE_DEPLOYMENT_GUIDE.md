# 🚀 Free Live Deployment Guide: ECommerce Design Suite (Supabase Edition)

This guide provides step-by-step instructions to deploy the entire **ECommerce Design Suite** live on the internet **100% FREE** using your **Supabase PostgreSQL Database**.

---

## 🏗️ Free Stack Architecture Overview

| Component | Free Provider | Free Tier Benefits |
| :--- | :--- | :--- |
| **PostgreSQL Database** | **[Supabase](https://supabase.com)** | 500 MB Free PostgreSQL, real-time pooled connections, web SQL editor |
| **Backend API Server** | **[Render.com](https://render.com)** | 750 free Web Service hours/month, Node.js native, auto-builds from GitHub |
| **Frontend Storefront** | **[Vercel](https://vercel.com)** | High-speed global CDN, automatic deployments from GitHub |
| **AI Assistant Engine** | **[Google AI Studio](https://aistudio.google.com)** | Free Gemini 2.5/3.0 API quota |

---

## ⚡ Step 1: Connect & Seed Your Supabase Database

### 1. Retrieve your Supabase Connection String
1. Log in to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Go to **Project Settings** -> **Database**.
3. Under **Connection string**, select **URI**.
4. Copy the connection string. It will look like:
   ```env
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
   *(Note: Replace `[YOUR-PASSWORD]` with your actual Supabase database password).*

### 2. Push Schema & Seed Products to Supabase
Run the Drizzle database push and catalog seed commands from your local PowerShell terminal targeting your Supabase URL:

```powershell
# Set your Supabase connection string for this session
$env:DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Push Drizzle schema to Supabase
pnpm --filter @workspace/db run push

# Seed products, verified reviews, and stock levels
pnpm --filter @workspace/db run seed
```

---

## ⚙️ Step 2: Deploy Backend API Server (Render.com)

1. Ensure your code is pushed to your **GitHub** repository.
2. Log in to **[Render.com](https://render.com)**.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository: `ECommerce-Design-Suite`.
5. Configure settings:
   - **Name**: `shopnow-api`
   - **Region**: Choose closest to your Supabase region (e.g. US East / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm run build:api`
   - **Start Command**: `pnpm --filter @workspace/api-server run start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
   - `GEMINI_API_KEY`: `<Your-Gemini-API-Key>` *(From Google AI Studio)*
   - `NODE_ENV`: `production`
7. Click **Create Web Service**.
8. Note your live API URL once deployed (e.g. `https://shopnow-api.onrender.com`).

---

## 🌐 Step 3: Deploy Frontend Storefront (Vercel)

1. Log in to **[Vercel.com](https://vercel.com)** using GitHub.
2. Click **Add New...** -> **Project** and select `ECommerce-Design-Suite`.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `artifacts/shopnow`
   - **Build Command**: `pnpm --filter @workspace/shopnow run build`
   - **Output Directory**: `dist/public`
4. Expand **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://shopnow-api.onrender.com` *(Your Render backend URL)*
5. Click **Deploy**.
6. Vercel will host your storefront live on a global CDN!

---

## ✅ Post-Deployment Verification

1. **API Check**: Open `https://shopnow-api.onrender.com/api/products` in browser — it should return your Supabase database catalog in JSON format.
2. **Frontend Check**: Open your Vercel storefront URL. Browse products, add items to cart, and place a test order.
3. **AI Chatbot Check**: Click the floating AI Assistant on your live site and ask: *"Show me gaming laptops under $1200"* to test Gemini AI integration!
