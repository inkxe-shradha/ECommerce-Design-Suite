import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'wouter';

interface MarkdownMessageProps {
  content: string;
  className?: string;
  onLinkClick?: () => void;
}

export const MarkdownMessage = memo(function MarkdownMessage({
  content,
  className = '',
  onLinkClick,
}: MarkdownMessageProps) {
  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none wrap-break-word ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render internal links with wouter Link, external links with target="_blank"
          a: ({ href, children }) => {
            if (href && href.startsWith('/')) {
              return (
                <Link
                  href={href}
                  onClick={onLinkClick}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-0.5"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                {children}
              </a>
            );
          },
          // Compact paragraphs for chat
          p: ({ children }) => (
            <p className="my-1 leading-relaxed">{children}</p>
          ),
          // Styled lists
          ul: ({ children }) => (
            <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          // Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
              {children}
            </strong>
          ),
          // Code blocks
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-mono text-indigo-700 dark:text-indigo-300">
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2.5 my-2 text-xs font-mono overflow-x-auto ${codeClassName}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-2">{children}</pre>,
          // Headings scaled for chat
          h1: ({ children }) => (
            <h1 className="text-base font-bold mt-3 mb-1.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold mt-2.5 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-indigo-400 dark:border-indigo-600 pl-3 my-2 text-neutral-600 dark:text-neutral-400 italic">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <table className="min-w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-left font-semibold border-b border-neutral-200 dark:border-neutral-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-3 border-neutral-200 dark:border-neutral-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
