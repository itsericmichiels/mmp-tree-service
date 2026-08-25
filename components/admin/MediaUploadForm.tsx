// components/admin/MediaUploadForm.tsx
export function MediaUploadForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="estimate-panel" style={{ marginBottom: 32 }}>
      <div className="form-field">
        <label htmlFor="file">Image File</label>
        <input id="file" name="file" type="file" accept=".jpg,.jpeg,.png,.webp" required />
      </div>
      <div className="form-field">
        <label htmlFor="alt">Alt Text</label>
        <input id="alt" name="alt" type="text" required />
        <p className="form-note">
          Describe what&apos;s in the photo — used for accessibility and image SEO.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="tags">Tags (comma-separated, optional)</label>
        <input id="tags" name="tags" type="text" placeholder="canton, storm-damage" />
      </div>
      <button type="submit" className="btn btn-orange">
        Upload Image
      </button>
    </form>
  );
}
