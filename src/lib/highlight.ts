const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ESCAPES[ch]);
}

const TOKEN =
  /(\/\/.*$)|(&quot;.*?&quot;)|\b(pragma|solidity|import|from|contract|is|uint256|public|constant|constructor|function|address|internal|override|if|return|super)\b|\b(\d[\d_]*)\b/gm;

/** Minimal Solidity highlighter. Input is escaped first, so the result is safe to inject as HTML. */
export function highlightSolidity(source: string): string {
  return escapeHtml(source).replace(TOKEN, (match, comment, str, keyword) => {
    const cls = comment ? 'c' : str ? 's' : keyword ? 'k' : 'n';
    return `<span class="${cls}">${match}</span>`;
  });
}
