type Token =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string; language: string };

function parseMarkdown(markdown: string): Token[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const tokens: Token[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let inCode = false;
  let codeLanguage = "";
  let code: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      tokens.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length) {
      tokens.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        tokens.push({ type: "code", code: code.join("\n"), language: codeLanguage });
        code = [];
        codeLanguage = "";
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      tokens.push({ type: "heading", level: 3, text: line.slice(4) });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      tokens.push({ type: "heading", level: 2, text: line.slice(3) });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  return tokens;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-view">
      {parseMarkdown(markdown).map((token, index) => {
        if (token.type === "heading") {
          const Heading = token.level === 2 ? "h2" : "h3";
          return <Heading key={index}>{token.text}</Heading>;
        }

        if (token.type === "list") {
          return (
            <ul key={index}>
              {token.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (token.type === "code") {
          return (
            <pre key={index}>
              <code data-language={token.language}>{token.code}</code>
            </pre>
          );
        }

        return <p key={index}>{token.text}</p>;
      })}
    </div>
  );
}
