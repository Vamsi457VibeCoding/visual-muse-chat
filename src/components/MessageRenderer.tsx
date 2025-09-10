import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MessageRendererProps {
  content: string;
  className?: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => <h1 className="text-lg font-bold text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium text-foreground">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-foreground leading-relaxed">{children}</p>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return isInline ? (
              <code className="bg-muted text-foreground px-1 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-muted border border-border rounded-md p-3 overflow-x-auto">
                <code className="text-foreground text-xs font-mono" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-2 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-md">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left text-xs font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-sm text-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;