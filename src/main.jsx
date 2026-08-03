import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { supabaseConfigured } from './lib/supabaseClient.js'

function SetupNotice() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0E0F0D', color: '#F4EFE6', fontFamily: 'DM Sans, system-ui, sans-serif', padding: 24,
    }}>
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 12 }}>Thrifty.ke isn't connected yet</h1>
        <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: 16 }}>
          This site is running, but it can't reach its database. You (or whoever deployed it) need to set two environment variables:
        </p>
        <pre style={{ background: '#1F221D', padding: 16, borderRadius: 12, fontSize: 13, overflowX: 'auto' }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p style={{ opacity: 0.7, lineHeight: 1.6, marginTop: 16, fontSize: 14 }}>
          Locally: put these in a <code>.env</code> file and restart <code>npm run dev</code>.<br />
          On Vercel: add them under Project Settings â†’ Environment Variables, then redeploy.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {supabaseConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <SetupNotice />
    )}
  </StrictMode>,
)