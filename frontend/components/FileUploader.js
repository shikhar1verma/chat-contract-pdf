import { useState } from 'react';
import { postIngest } from '@/lib/api';

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    const res = await postIngest(formData);
    const data = await res.json();
    localStorage.setItem('upload_id', data.upload_id);
    setUploading(false);
  };

  return (
    <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl hover:border-primary/60 transition">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      <span className="text-gray-500">
        {uploading ? 'Uploading…' : 'Click or drag a PDF here'}
      </span>
    </label>
  );
}
