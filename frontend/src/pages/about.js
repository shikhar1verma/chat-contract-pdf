import React from "react";

export default function About() {
  return (
    <article className="prose dark:prose-invert mx-auto mt-8 max-w-none px-4 md:px-0">
      <h1>About</h1>
      <p>
        This site is an educational demo showing how to chat with documents
        using Retrieval-Augmented Generation (RAG).
      </p>

      {/* responsive diagram */}
      <picture>
        <source
          media="(max-width: 640px)"
          srcSet="/architecture_flow_vertical.png"
        />
        <source
          media="(min-width: 641px)"
          srcSet="/architecture_flow.png"
        />
        <img
          src="/architecture_flow.png"
          alt="System Architecture Diagram"
          style={{ width: "100%", height: "auto" }}
        />
      </picture>

      <h2>1. Components</h2>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Layer</th>
            <th className="px-2 py-1 text-left">Technology</th>
            <th className="px-2 py-1 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border dark:border-gray-700 px-2 py-1 font-medium">Frontend</td>
            <td className="border dark:border-gray-700 px-2 py-1">Next.js + Tailwind CSS</td>
            <td className="border dark:border-gray-700 px-2 py-1">
              React app on Vercel; renders UI and calls API endpoints
            </td>
          </tr>
          <tr>
            <td className="border dark:border-gray-700 px-2 py-1 font-medium">Backend</td>
            <td className="border dark:border-gray-700 px-2 py-1">FastAPI (Docker)</td>
            <td className="border dark:border-gray-700 px-2 py-1">
              Exposes <code>/ingest</code> and <code>/chat</code> endpoints
            </td>
          </tr>
          <tr>
            <td className="border dark:border-gray-700 px-2 py-1 font-medium">Vector DB</td>
            <td className="border dark:border-gray-700 px-2 py-1">
              PostgreSQL + PGVector (via Supabase)
            </td>
            <td className="border dark:border-gray-700 px-2 py-1">
              Stores document embeddings for similarity search
            </td>
          </tr>
          <tr>
            <td className="border dark:border-gray-700 px-2 py-1 font-medium">Embeddings</td>
            <td className="border dark:border-gray-700 px-2 py-1">Google Gemini text-embedding-004</td>
            <td className="border dark:border-gray-700 px-2 py-1">
              Converts text chunks into high-dimensional vectors
            </td>
          </tr>
          <tr>
            <td className="border dark:border-gray-700 px-2 py-1 font-medium">LLM</td>
            <td className="border dark:border-gray-700 px-2 py-1">Google Gemini Flashlight</td>
            <td className="border dark:border-gray-700 px-2 py-1">
              Generates answers given user query + retrieved contexts
            </td>
          </tr>
        </tbody>
      </table>

      <h2>2. Data Flow</h2>
      <ol className="list-decimal pl-6">
        <li>
          <strong>Ingestion</strong> (<code>/ingest</code>):
          <ul className="list-disc pl-6">
            <li>FastAPI receives a PDF upload</li>
            <li>Splits into text chunks → requests embeddings from Gemini</li>
            <li>Stores resulting vectors in Supabase (Postgres+PGVector)</li>
          </ul>
        </li>
        <li>
          <strong>Chat</strong> (<code>/chat</code>):
          <ul className="list-disc pl-6">
            <li>FastAPI receives user query</li>
            <li>Runs similarity search in PGVector → retrieves top-k chunks</li>
            <li>Formats those chunks into prompt context</li>
            <li>Sends query+context to Gemini Flashlight → gets answer</li>
            <li>Returns JSON response back to Next.js UI</li>
          </ul>
        </li>
      </ol>

      <h2>3. Deployment</h2>
      <ul className="list-disc pl-6">
        <li>
          <strong>Frontend</strong> on <em>Vercel</em> (auto-deploy from GitHub)
        </li>
        <li>
          <strong>Backend</strong> on <em>Render</em> Web Service (Docker)
        </li>
        <li>
          <strong>Database</strong> managed by <em>Supabase</em> (Postgres+
          PGVector)
        </li>
        <li>
          <strong>Models</strong> via Google Cloud’s <em>Gemini APIs</em> (free
          tier for demos)
        </li>
      </ul>

      <h2>4. Links</h2>
      <ul className="list-disc pl-6">
        <li>
          <a
            href="https://github.com/shikhar1verma/document-ai-chat"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repo
          </a>
        </li>
        <li>
          <a
            href="https://document-ai-chat.theshikhar.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live demo
          </a>
        </li>
      </ul>

      <p className="italic text-sm text-gray-600 dark:text-gray-400">
        Educational prototype only.
      </p>
    </article>
  );
}
