// pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error || 'Login failed');
      return;
    }
    // store token + tenantSlug in localStorage
    localStorage.setItem('token', j.token);
    localStorage.setItem('tenantSlug', j.tenantSlug);
    localStorage.setItem('role', j.role);
    router.push('/notes');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Notes App — Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <input placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Login</button>
        </div>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 12 }}>
        <strong>Test accounts (password: password)</strong>
        <ul>
          <li>admin@acme.test</li>
          <li>user@acme.test</li>
          <li>admin@globex.test</li>
          <li>user@globex.test</li>
        </ul>
      </div>
    </div>
  );
}
