import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-1 container mx-auto w-full max-w-5xl px-4 md:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
