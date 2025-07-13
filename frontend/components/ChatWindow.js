import { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { postChat } from '@/lib/api';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendQuestion = async () => {
    if (!input.trim()) return;
    const uploadId = localStorage.getItem('upload_id');
    if (!uploadId) return alert('Upload a PDF first.');
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
            {m.text}
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
          placeholder="Ask a question…"
          onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
        />
        <button
          onClick={sendQuestion}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 rounded-xl transition"
        >
          Send <IoSend className="text-xl" />
        </button>
      </div>
    </>
  );
}
