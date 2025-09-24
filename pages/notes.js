// pages/notes.js
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
  }).then(async (r) => {
    if (!r.ok) throw await r.json();
    return r.json();
  });

export default function NotesPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [role, setRole] = useState('');
  const { data: notes, mutate } = useSWR('/api/notes', fetcher);
  const [error, setError] = useState('');
  const [tenantPlan, setTenantPlan] = useState('FREE');

  useEffect(() => {
    setTenantSlug(localStorage.getItem('tenantSlug'));
    setRole(localStorage.getItem('role'));
    // fetch tenant data (we can call /api/tenants/:slug/info if created; but not required)
    async function getTenant() {
      const slug = localStorage.getItem('tenantSlug');
      if (!slug) return;
      // We'll try to use a small call to GET /api/notes and derive plan by attempting to create beyond limit.
      // Instead, call a refresh to check plan by making a dummy request to fetch notes — plan is encoded in responses in our API? For simplicity, skip.
      // To show "Upgrade" logic, we will count notes and if >=3 and role permits show upgrade.
    }
    getTenant();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ title, content })
      }).then(async (r) => {
        if (!r.ok) {
          const j = await r.json();
          throw new Error(j.error || 'Failed');
        }
      });
      setTitle('');
      setContent('');
      mutate();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await fetch('/api/notes/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    mutate();
  }

  async function handleUpgrade() {
    const slug = tenantSlug;
    const res = await fetch('/api/tenants/' + slug + '/upgrade', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    if (res.ok) {
      alert('Upgraded to Pro — note limit lifted');
      mutate();
      // refresh page
    } else {
      const j = await res.json();
      alert('Upgrade failed: ' + (j.error || JSON.stringify(j)));
    }
  }

  if (!localStorage.getItem('token')) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not logged in</h2>
        <button onClick={() => router.push('/')}>Go to login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Notes</h1>
      <div>Tenant: {tenantSlug} · Role: {role}</div>

      <div style={{ marginTop: 20 }}>
        <form onSubmit={handleCreate}>
          <div>
            <input placeholder="title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <textarea placeholder="content" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit">Create</button>
          </div>
        </form>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Your notes</h2>
        {!notes && <div>Loading...</div>}
        {notes && notes.length === 0 && <div>No notes</div>}
        {notes && notes.map(n => (
          <div key={n.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
            <strong>{n.title}</strong>
            <div>{n.content}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => handleDelete(n.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {notes && notes.length >= 3 && (
          <div>
            <strong>You have reached the Free plan limit (3 notes).</strong>
            {role === 'ADMIN' ? (
              <div>
                <button onClick={handleUpgrade}>Upgrade to Pro</button>
              </div>
            ) : (
              <div>Ask your Admin to upgrade to Pro.</div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('tenantSlug');
          localStorage.removeItem('role');
          router.push('/');
        }}>Logout</button>
      </div>
    </div>
  );
}
