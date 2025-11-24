import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiEye, FiEdit3 } from "react-icons/fi";
import "highlight.js/styles/github-dark.css";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Markdown formatında yazabilirsin...",
  minHeight = "200px",
}) {
  const [mode, setMode] = useState("edit"); // "edit" | "preview" | "split"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 px-4 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition ${
              mode === "edit"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiEdit3 className="h-4 w-4" />
            Yaz
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition ${
              mode === "preview"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiEye className="h-4 w-4" />
            Önizle
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition ${
              mode === "split"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiEdit3 className="h-4 w-4" />
            <FiEye className="h-4 w-4" />
            Böl
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Markdown desteklenir: **kalın**, *italik*, `kod`, ```kod bloğu```
        </div>
      </div>

      <div className="flex gap-2">
        {mode !== "preview" && (
          <div className={mode === "split" ? "flex-1" : "w-full"}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full rounded-b-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}

        {mode !== "edit" && (
          <div
            className={`rounded-b-lg border border-gray-300 bg-white px-4 py-3 ${
              mode === "split" ? "flex-1" : "w-full"
            }`}
            style={{ minHeight }}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <pre className="rounded-lg bg-gray-900 p-4">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code
                        className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold text-gray-900" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold text-gray-900" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold text-gray-900" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 text-gray-700" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 text-gray-700" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-gray-300 pl-4 italic text-gray-600"
                      {...props}
                    />
                  ),
                }}
              >
                {value || "*Önizleme için içerik yazın...*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

