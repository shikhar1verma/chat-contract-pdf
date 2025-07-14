import FileUploader from '@/components/FileUploader';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <section className="my-8 w-full rounded-2xl bg-white dark:bg-gray-800 p-6 shadow md:p-8">
      <FileUploader />
      <div className="my-6 border-t" />
      <ChatWindow />
    </section>
  );
}
