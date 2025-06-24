import FileUploader from '../components/FileUploader';
import ChatWindow from '../components/ChatWindow';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Contract Chat Demo</h1>
      <FileUploader />
      <hr />
      <ChatWindow />
    </div>
  );
}
