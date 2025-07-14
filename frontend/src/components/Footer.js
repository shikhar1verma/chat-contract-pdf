export default function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6">
        <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} &nbsp;
            <a
              href="https://theshikhar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary dark:text-primary-light hover:underline"
            >
              Shikhar Verma
            </a>
            &nbsp;• Educational prototype only. No legal advice implied.
          </p>
          <p className="mt-2">
            Source code on{" "}
            <a
              href="https://github.com/shikhar1verma/document-ai-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary dark:text-primary-light hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    );
  }
  