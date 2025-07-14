import { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { postChat } from "@/lib/api";
import ChatMessage from "./ChatMessage";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const endRef = useRef(null);

  // auto-scroll each time messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // watch localStorage / custom events for upload info
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncInfo = () =>
      JSON.parse(localStorage.getItem("docchat_info") || "null");

    const setInfo = (info) => {
      setFileInfo(info);
      if (!info) setMessages([]);
    };

    // initial boot
    setInfo(syncInfo());

    const handleCustom = (e) => setInfo(e.detail);

    const handleStorage = (e) => {
      if (e.key === "docchat_info") setInfo(syncInfo());
    };

    window.addEventListener("docchat_info_saved", handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("docchat_info_saved", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const uploadId = fileInfo?.upload_id;

  const sendQuestion = async () => {
    if (!input.trim() || !uploadId) return;
    const question = input.trim();
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");

    try {
      const res = await postChat({ question, upload_id: uploadId });
      const { answer } = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `**Error:** ${err.message || "Failed to fetch answer."}`,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* chat pane */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* input bar */}
      <div className="flex gap-2 border-t border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-primary"
          placeholder={
            uploadId ? "Ask a question…" : "Upload a document first…"
          }
          disabled={!uploadId}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
        />
        <button
          onClick={sendQuestion}
          disabled={!uploadId || !input.trim()}
          className={`flex items-center gap-2 px-4 rounded-xl transition font-semibold
            ${!uploadId || !input.trim()
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-white"
            }`}
        >
          Send <IoSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}
