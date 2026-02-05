import type { WhatsAppTemplate } from "@/app/types/template";

interface TemplatePreviewProps {
  template: Partial<WhatsAppTemplate>;
  sampleData?: Record<string, string>;
}

export function TemplatePreview({ template, sampleData = {} }: TemplatePreviewProps) {
  // Replace variables with sample data
  const replaceVariables = (text: string): string => {
    if (!text) return "";
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return sampleData[variable] || `[${variable}]`;
    });
  };

  // Parse WhatsApp markdown: *bold*, _italic_, ~strikethrough~
  const parseMarkdown = (text: string): JSX.Element => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    let key = 0;

    // Simple regex for WhatsApp formatting
    const formatRegex = /(\*[^*]+\*|_[^_]+_|~[^~]+~)/g;
    let match;

    const processedText = replaceVariables(text);

    while ((match = formatRegex.exec(processedText)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(
          <span key={`text-${key++}`}>{processedText.slice(currentIndex, match.index)}</span>
        );
      }

      const matchedText = match[0];
      const innerText = matchedText.slice(1, -1);

      // Apply formatting based on delimiter
      if (matchedText.startsWith("*")) {
        parts.push(
          <strong key={`bold-${key++}`} style={{ fontWeight: 700 }}>
            {innerText}
          </strong>
        );
      } else if (matchedText.startsWith("_")) {
        parts.push(
          <em key={`italic-${key++}`} style={{ fontStyle: "italic" }}>
            {innerText}
          </em>
        );
      } else if (matchedText.startsWith("~")) {
        parts.push(
          <span key={`strike-${key++}`} style={{ textDecoration: "line-through" }}>
            {innerText}
          </span>
        );
      }

      currentIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (currentIndex < processedText.length) {
      parts.push(<span key={`text-${key++}`}>{processedText.slice(currentIndex)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      {/* WhatsApp Chat Header */}
      <div
        style={{
          background: "#075e54",
          padding: "12px 16px",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#d1d5db",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#6b7280",
          }}
        >
          B
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            Balemoo
          </div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            WhatsApp Business
          </div>
        </div>
      </div>

      {/* Chat Background */}
      <div
        style={{
          background: "#ece5dd",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          padding: "20px 16px",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          minHeight: "300px",
        }}
      >
        {/* Message Bubble */}
        <div
          style={{
            background: "#dcf8c6",
            padding: "10px 12px 6px",
            borderRadius: "8px",
            maxWidth: "85%",
            boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
            position: "relative",
          }}
        >
          {/* Header (if exists) */}
          {template.content?.header && (
            <div style={{ marginBottom: "8px" }}>
              {template.content.header.type === "TEXT" && (
                <div
                  style={{
                    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#000000",
                    marginBottom: "4px",
                  }}
                >
                  {replaceVariables(template.content.header.text || "")}
                </div>
              )}
              {template.content.header.type === "IMAGE" && (
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    background: "#e5e7eb",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  [Image]
                </div>
              )}
              {template.content.header.type === "VIDEO" && (
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    background: "#1f2937",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: "#ffffff",
                  }}
                >
                  [Video]
                </div>
              )}
              {template.content.header.type === "DOCUMENT" && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#ffffff",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  📄 Document
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div
            style={{
              fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
              fontSize: "0.9375rem",
              color: "#000000",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {parseMarkdown(template.content?.body?.text || "")}
          </div>

          {/* Footer */}
          {template.content?.footer && (
            <div
              style={{
                fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
                fontSize: "0.8125rem",
                color: "#667781",
                marginTop: "8px",
              }}
            >
              {replaceVariables(template.content.footer.text)}
            </div>
          )}

          {/* Timestamp */}
          <div
            style={{
              textAlign: "right",
              marginTop: "4px",
              fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
              fontSize: "0.6875rem",
              color: "#667781",
            }}
          >
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Buttons (if exists) */}
        {template.content?.buttons && template.content.buttons.length > 0 && (
          <div
            style={{
              marginTop: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {template.content.buttons.map((button, index) => (
              <div
                key={index}
                style={{
                  background: "#ffffff",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "#00a5f4",
                  boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                  cursor: "pointer",
                }}
              >
                {button.type === "QUICK_REPLY" && `↩️ ${button.text}`}
                {button.type === "URL" && `🔗 ${button.text}`}
                {button.type === "PHONE_NUMBER" && `📞 ${button.text}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
