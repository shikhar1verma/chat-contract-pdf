import { useState, useEffect, useRef } from "react";
import { postIngest, getStatus, deleteUpload } from "@/lib/api";

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const pollingRef = useRef({ cancel: false, start: 0 });

  // Load any saved upload from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("docchat_info") || "null");
    if (stored) setFileInfo(stored);
  }, []);

  // Poll status every 7s, stop on success/failure or after 3min
  useEffect(() => {
    if (!fileInfo?.upload_id) return;

    pollingRef.current.cancel = false;
    pollingRef.current.start = Date.now();

    const poll = async () => {
      const { cancel, start } = pollingRef.current;
      if (cancel) return;
      if (Date.now() - start > 3 * 60 * 1000) {
        // stop after 3 minutes
        pollingRef.current.cancel = true;
        return;
      }
      try {
        const { progress } = await getStatus(fileInfo.upload_id);
        setStatusMsg(progress);
        // stop on complete or error
        if (
          progress.startsWith("100%") ||
          progress.toLowerCase().startsWith("error")
        ) {
          pollingRef.current.cancel = true;
        }
      } catch {
        // on fetch error (e.g. 404), stop polling
        pollingRef.current.cancel = true;
      }
    };

    // initial fetch + interval
    poll();
    const id = setInterval(poll, 7000);
    return () => {
      pollingRef.current.cancel = true;
      clearInterval(id);
    };
  }, [fileInfo]);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      return alert("File exceeds 10 MB limit.");
    }
    if (file.type !== "application/pdf") {
      return alert("Only PDF files supported.");
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await postIngest(formData);
      const data = await res.json(); // { upload_id, progress }
      const newInfo = {
        upload_id: data.upload_id,
        filename: file.name,
      };
      localStorage.setItem("docchat_info", JSON.stringify(newInfo));
      setFileInfo(newInfo);
      setStatusMsg(data.progress);
      window.dispatchEvent(
        new CustomEvent("docchat_info_saved", { detail: newInfo })
      );
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Reset upload + stop polling
  const handleReset = async () => {
    if (!fileInfo) return;
    try {
      await deleteUpload(fileInfo.upload_id);           // hit API
    } catch {
      /* ignore */
    }
    // purge localStorage
    localStorage.removeItem("docchat_info");
    localStorage.removeItem("docchat_messages");
    // notify every tab + ChatWindow
    window.dispatchEvent(new CustomEvent("docchat_info_saved", { detail: null }));
  
    setFileInfo(null);
    setStatusMsg(null);
    pollingRef.current.cancel = true;
  };

  if (fileInfo) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
        <div>
          <p className="font-medium">{fileInfo.filename}</p>
          {statusMsg && !statusMsg.startsWith("100%") ? (
            <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-light">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {statusMsg}
            </div>
          ) : (
            <p className="text-sm text-green-600">Document ready for chat ✓</p>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-red-600 hover:underline"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-40 cursor-pointer
        border-2 border-dashed rounded-xl transition
        ${
          uploading
            ? "border-primary/60 bg-primary/5 dark:bg-primary/10"
            : "border-gray-300 dark:border-gray-700 hover:border-primary/60"
        }`}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />
      {uploading ? (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
          <span className="text-primary">Uploading…</span>
        </>
      ) : (
        <>
          <span className="text-gray-500">Click or drag a PDF here</span>
          <span className="text-xs text-gray-400 mt-1">
            Max size : 10 MB • PDF only
          </span>
        </>
      )}
    </label>
  );
}
