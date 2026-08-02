import dotenv from 'dotenv';
import path from 'path';

// Load root .env first (cwd is artifacts/api-server when run via pnpm filter)
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();
