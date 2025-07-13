import FileUploader from '../components/FileUploader';
import ChatWindow from '../components/ChatWindow';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <section className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-primary mb-6">
          Contract Chat Demo
        </h1>
        <FileUploader />
        <div className="my-6 border-t" />
        <ChatWindow />
      </section>
    </main>
  );
}

