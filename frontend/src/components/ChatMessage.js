import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`px-4 py-2 rounded-2xl shadow w-fit max-w-full
        ${isUser
          ? "ml-auto bg-primary text-white"
          : "mr-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"}`}
    >
      <div className="prose max-w-none text-sm md:text-base leading-relaxed
                      prose-p:my-2 prose-li:my-1 whitespace-pre-wrap
                      dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
