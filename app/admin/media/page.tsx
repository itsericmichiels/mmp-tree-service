// app/admin/media/page.tsx
import { getAllMedia } from "@/lib/media";
import { getAllHeroAssignments } from "@/lib/hero-images";
import { builtSlugs } from "@/lib/slugs";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { MediaGalleryItem } from "@/components/admin/MediaGalleryItem";
import {
  uploadMediaAction,
  deleteMediaAction,
  toggleOurWorkAction,
  assignHeroAction,
  clearHeroAction,
} from "@/lib/media-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminMediaPage() {
  const media = getAllMedia();
  const assignments = getAllHeroAssignments();
  const pageSlugs = builtSlugs();

  return (
    <section className="section">
      <div className="container">
        <h1>Media Library</h1>
        <MediaUploadForm action={uploadMediaAction} />
        {media.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <div className="grid grid--3">
            {media.map((item) => {
              const assignedSlug =
                Object.entries(assignments).find(([, mediaId]) => mediaId === item.id)?.[0] ?? "";
              return (
                <MediaGalleryItem
                  key={item.id}
                  item={item}
                  pageSlugs={pageSlugs}
                  assignedSlug={assignedSlug}
                  deleteAction={deleteMediaAction}
                  toggleOurWorkAction={toggleOurWorkAction}
                  assignHeroAction={assignHeroAction}
                  clearHeroAction={clearHeroAction}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
