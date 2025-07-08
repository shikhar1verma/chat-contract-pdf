import { useState } from 'react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendQuestion = async () => {
    if (!input) return;
    const uploadId = localStorage.getItem('upload_id');
    if (!uploadId) {
      alert('Please upload a PDF first'); return;
    }
    const question = input;
    setMessages([...messages, { from: 'user', text: question }]);
    setInput('');
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, upload_id: uploadId }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { from: 'bot', text: data.answer }]);
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.from}:</strong> {m.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question"
      />
      <button onClick={sendQuestion}>Send</button>
    </div>
  );
}
