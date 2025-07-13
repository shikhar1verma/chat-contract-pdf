export const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function postIngest(formData) {
  return fetch(`${API_BASE}/ingest`, { method: 'POST', body: formData });
}

export async function postChat(payload) {
  return fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
