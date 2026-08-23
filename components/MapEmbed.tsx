// components/MapEmbed.tsx
export function MapEmbed() {
  return (
    <div className="map-embed">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.3016085594863!2d-84.6792009871628!3d34.03613357305119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f59f0efaae4077%3A0xd48d5e173cc2099!2sMMP%20Tree%20Service%20LLC!5e0!3m2!1sen!2ses!4v1787495303171!5m2!1sen!2ses"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        title="MMP Tree Service LLC location map"
      />
    </div>
  );
}
