import { loginAction } from "./actions";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1>Admin Login</h1>
        {error && (
          <p className="form-note" style={{ color: "#c0392b", textAlign: "left" }}>
            Wrong password. Try again.
          </p>
        )}
        <form action={loginAction} className="estimate-panel">
          <input type="hidden" name="next" value={next ?? "/admin/blog"} />
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoFocus />
          </div>
          <button type="submit" className="btn btn-orange btn-block">
            Log In
          </button>
        </form>
      </div>
    </section>
  );
}
