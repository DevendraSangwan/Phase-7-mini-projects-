import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const tokenKey = 'collabsphere-auth-token';

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'The request failed.');
  return data;
}

function AuthApp() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return undefined;
    let active = true;
    request('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(tokenKey);
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      localStorage.setItem(tokenKey, data.token);
      setUser(data.user);
      setMessage(mode === 'register' ? 'Your account is ready.' : 'Welcome back.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setUser(null);
    setMode('login');
    setMessage('You have signed out.');
  }

  return (
    <main className="auth-shell">
      <section className="brand-panel">
        <div className="brand-mark" aria-hidden="true">C</div>
        <p className="eyebrow">COLLABSPHERE</p>
        <h1>Make good work happen together.</h1>
        <p className="brand-copy">A simple place to get started with your team workspace.</p>
        <div className="brand-note"><span>01</span><span>Your account, ready in moments.</span></div>
      </section>
      <section className="form-panel">
        <div className="auth-card">
          {user ? (
            <div className="signed-in">
              <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
              <p className="eyebrow">SIGNED IN</p>
              <h2>Hi, {user.name}</h2>
              <p className="muted">{user.email}</p>
              <div className="account-status"><span className="status-dot"></span>Your account is connected.</div>
              <button className="primary-button" onClick={logout} type="button">Sign out</button>
            </div>
          ) : (
            <>
              <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
              <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
              <p className="muted">
                {mode === 'login' ? 'Enter your details below to continue.' : 'A few details and you are all set.'}
              </p>
              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <label>
                    Your name
                    <input name="name" type="text" autoComplete="name" maxLength="100" placeholder="Alex Morgan" required />
                  </label>
                )}
                <label>
                  Email address
                  <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                </label>
                <label>
                  Password
                  <input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="72" placeholder="At least 8 characters" required />
                </label>
                <button className="primary-button" disabled={busy} type="submit">
                  {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                  {!busy && <span aria-hidden="true">→</span>}
                </button>
              </form>
              <p className="switch-mode">
                {mode === 'login' ? 'New to CollabSphere?' : 'Already have an account?'}
                {' '}
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>
                  {mode === 'login' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </>
          )}
          <p aria-live="polite" className={`form-message${message ? ' visible' : ''}`}>{message}</p>
          <p className="secure-note"><span aria-hidden="true">●</span> Your password is securely encrypted.</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<AuthApp />);
