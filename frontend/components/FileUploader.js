import { useState } from 'react';

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    await fetch('http://localhost:8000/ingest', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    localStorage.setItem('upload_id', data.upload_id);
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleChange} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
