import { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { postChat } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const endRef = useRef(null);


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (typeof window === 'undefined') return;
    setFileInfo(JSON.parse(localStorage.getItem('docchat_info') || 'null'));
    const handleCustom = (e) => setFileInfo(e.detail);
    window.addEventListener('docchat_info_saved', handleCustom);

    const handleStorage = (e) => {
      if (e.key === 'docchat_info') {
        setFileInfo(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('docchat_info_saved', handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, [messages]);

  const uploadId = fileInfo?.upload_id;

  const sendQuestion = async () => {
    if (!input.trim()) return;
    if (!uploadId) return alert('Upload a document first.');
    const question = input;
    setMessages([...messages, { from: 'user', text: question }]);
    setInput('');
    const res = await postChat({ question, upload_id: uploadId });
    const { answer } = await res.json();
    setMessages((m) => [...m, { from: 'bot', text: answer }]);
  };

  return (
    <>
      <div className="h-64 overflow-y-auto space-y-4 mb-4 px-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-2xl shadow
              ${m.from === 'user'
                ? 'ml-auto bg-primary text-white'
                : 'mr-auto bg-gray-100 text-gray-800'}`}
          >
            {m.from === 'user' ? (
              m.text
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {m.text}
              </ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-primary"
          placeholder={uploadId ? "Ask a question…" : "Upload a document first..."}
          disabled={!uploadId}
          onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
        />
        <button
          onClick={sendQuestion}
          disabled={!uploadId || !input.trim()}
          className={`flex items-center gap-2 px-4 rounded-xl transition font-semibold
            ${!uploadId || !input.trim() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-white'}`}
        >
          Send <IoSend className="text-xl" />
        </button>
      </div>
    </>
  );
}
