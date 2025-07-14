export const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function postIngest(formData) {
  return fetch(`${API_BASE}/ingest`, { method: "POST", body: formData });
}

export async function postChat(payload) {
  return fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getStatus(uploadId) {
  const res = await fetch(`${API_BASE}/status/${uploadId}`);
  if (!res.ok) throw new Error("status fetch failed");
  return res.json();
}

export async function deleteUpload(uploadId) {
  const res = await fetch(`${API_BASE}/reset/${uploadId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("reset failed");
  return res.json();
}