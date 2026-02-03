import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Custom components for markdown rendering
const markdownComponents = {
  // Custom styling for code blocks
  code: ({ inline, className, children, ...props }: any) => {
    return inline ? (
      <code className={`${className} bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm`} {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-slate-200 dark:bg-slate-700 p-3 rounded-md overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  // Custom styling for headings
  h1: ({ children }: any) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-bold mb-2 mt-2">{children}</h3>,
  // Custom styling for paragraphs
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  // Custom styling for lists
  ul: ({ children }: any) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
  ol: ({ children }: any) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
  li: ({ children }: any) => <li className="mb-1">{children}</li>,
  // Custom styling for blockquotes
  blockquote: ({ children }: any) => <blockquote className="border-l-4 border-slate-400 dark:border-slate-500 pl-4 italic mb-2">{children}</blockquote>,
  // Custom styling for horizontal rules
  hr: () => <hr className="border-slate-300 dark:border-slate-600 my-4" />,
  // Custom styling for links
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  // Custom styling for tables
  table: ({ children }: any) => (
    <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 mb-2">
      {children}
    </table>
  ),
  th: ({ children }: any) => (
    <th className="border border-slate-300 dark:border-slate-600 px-2 py-1 bg-slate-100 dark:bg-slate-700 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1">
      {children}
    </td>
  ),
};

interface MarkdownFormatterProps {
  readonly content: string;
  readonly className?: string;
  readonly components?: any;
}

export function MarkdownFormatter({ 
  content, 
  className = "", 
  components = markdownComponents 
}: MarkdownFormatterProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert prose-headings:mt-3 prose-headings:mb-2 prose-p:mb-2 prose-p:mt-0 prose-pre:bg-slate-200 dark:prose-pre:bg-slate-700 prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-slate-400 dark:prose-blockquote:border-l-slate-500 ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}