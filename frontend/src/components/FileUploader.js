import { useState, useEffect } from 'react';
import { postIngest } from '@/lib/api';

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = JSON.parse(localStorage.getItem("docchat_info") || "null");
    if (stored) {
      // Check if within 7 days
      if (Date.now() - new Date(stored.created_at).getTime() > 7 * 24 * 3600e3) {
        localStorage.removeItem("docchat_info");
      } else {
        setFileInfo(stored);
      }
    }
  }, []);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported at the moment.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await postIngest(formData);
      const data = await res.json();
      const newFileInfo = {
        upload_id: data.upload_id,
        filename: file.name,
        created_at: Date.now()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('docchat_info', JSON.stringify(newFileInfo));
        window.dispatchEvent(
          new CustomEvent('docchat_info_saved', { detail: newFileInfo })
        );
      }
      setFileInfo(newFileInfo);
    } catch (error) {
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      if (fileInfo?.upload_id) {
        await fetch(`/api/reset/${fileInfo.upload_id}`, {
          method: 'DELETE'
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('docchat_info');
          window.dispatchEvent(
            new CustomEvent('docchat_info_saved', { detail: null })
          );
        }
        setFileInfo(null);
      }
    } catch (error) {
      alert('Error resetting document. Please try again.');
    }
  };

  if (fileInfo) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-xl bg-white">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📄</span>
          <div>
            <p className="font-medium">{fileInfo.filename}</p>
            <p className="text-sm text-green-600">Document ready for chat ✓</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-red-500 hover:text-red-600 text-sm hover:underline"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className={`flex flex-col items-center justify-center w-full h-40 cursor-pointer 
        border-2 border-dashed rounded-xl transition
        ${uploading 
          ? 'border-primary/60 bg-primary/5' 
          : 'border-gray-300 hover:border-primary/60'}`}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
              <span className="text-primary">Uploading…</span>
            </>
          ) : (
            <>
              <span className="text-gray-500">Click or drag a PDF here</span>
              <span className="text-sm text-gray-400 mt-1">Maximum file size: 10MB</span>
              <span className="text-xs text-gray-400 mt-1">Currently supporting PDF files only</span>
            </>
          )}
        </div>
      </label>
      <div className="text-center">
        <p className="text-xs text-gray-500">
          💡 <span className="font-medium">Note:</span> Only PDF files are supported at the moment
        </p>
      </div>
    </div>
  );
}