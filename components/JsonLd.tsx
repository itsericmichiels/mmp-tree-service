// components/JsonLd.tsx
// Renders a JSON-LD <script> tag, escaping `<` to prevent HTML-parser-level
// script tag breakout (JSON.stringify does not escape `<`, so a title
// containing `</script>` would otherwise close the tag early).
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
