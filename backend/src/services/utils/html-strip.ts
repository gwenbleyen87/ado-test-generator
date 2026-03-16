import striptags from 'striptags';

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  // Strip HTML tags, decode common entities, and normalize whitespace
  let text = striptags(html);
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}
