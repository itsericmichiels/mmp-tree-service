// components/admin/MediaGalleryItem.tsx
import type { MediaItem } from "@/lib/media";

export function MediaGalleryItem({
  item,
  pageSlugs,
  assignedSlug,
  deleteAction,
  toggleOurWorkAction,
  assignHeroAction,
  clearHeroAction,
}: {
  item: MediaItem;
  pageSlugs: string[];
  assignedSlug: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  toggleOurWorkAction: (formData: FormData) => void | Promise<void>;
  assignHeroAction: (formData: FormData) => void | Promise<void>;
  clearHeroAction: (formData: FormData) => void | Promise<void>;
}) {
  const isOurWork = item.tags.includes("our-work");

  return (
    <div className="card">
      <img className="card__img" src={item.url} alt={item.alt} />
      <div className="card__body">
        <p>{item.alt}</p>
        <div>
          {item.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <form action={toggleOurWorkAction}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="btn btn-outline-light btn-sm">
            {isOurWork ? "Remove from Our Work" : "Show on Our Work"}
          </button>
        </form>

        <div className="form-field">
          <label htmlFor={`hero-${item.id}`}>Use as hero for</label>
          <form action={assignHeroAction}>
            <select id={`hero-${item.id}`} name="slug" defaultValue={assignedSlug}>
              <option value="">— choose a page —</option>
              {pageSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
            <input type="hidden" name="mediaId" value={item.id} />
            <button type="submit" className="btn btn-green btn-sm">
              Assign Hero
            </button>
          </form>
        </div>

        {assignedSlug && (
          <div className="form-note">
            Currently hero for: {assignedSlug}
            <form action={clearHeroAction} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={assignedSlug} />
              <button type="submit" className="btn btn-sm btn-outline-light">
                Clear Hero
              </button>
            </form>
          </div>
        )}

        <form action={deleteAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="btn btn-sm"
            style={{ background: "#c0392b", color: "#fff" }}
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
