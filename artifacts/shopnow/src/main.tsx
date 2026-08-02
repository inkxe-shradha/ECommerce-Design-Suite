import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';

import App from './App';

import './index.css';

if (import.meta.env.VITE_API_BASE_URL) {
  setBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

setAuthTokenGetter(() => localStorage.getItem('shopnow_auth_token'));

createRoot(document.getElementById('root')!).render(<App />);
