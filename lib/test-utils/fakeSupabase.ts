// lib/test-utils/fakeSupabase.ts
// Minimal in-memory stand-in for the Supabase client, covering just the
// query shapes lib/blog.ts, lib/media.ts, lib/hero-images.ts, and
// lib/blog-categories.ts actually use, so unit tests don't hit the network.
type Row = Record<string, unknown>;

const UPSERT_KEY_COLUMN: Record<string, string> = {
  blog_posts: "slug",
  hero_assignments: "slug",
};

export function createFakeSupabase() {
  const tables: Record<string, Row[]> = {};
  const files: Record<string, Buffer> = {};

  function getTable(name: string): Row[] {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  }

  function makeBuilder(tableName: string) {
    const filters: ((row: Row) => boolean)[] = [];
    let orderBy: { col: string; ascending: boolean } | null = null;
    let pendingOp: { type: "insert" | "upsert" | "update" | "delete"; payload?: Row } | null = null;

    function applyFilters(list: Row[]): Row[] {
      return filters.reduce((acc, f) => acc.filter(f), list);
    }

    async function finalize(single: boolean) {
      const table = getTable(tableName);

      if (pendingOp?.type === "insert") {
        table.push({ ...pendingOp.payload });
      } else if (pendingOp?.type === "upsert") {
        const keyCol = UPSERT_KEY_COLUMN[tableName] ?? "id";
        const payload = pendingOp.payload!;
        const idx = table.findIndex((r) => r[keyCol] === payload[keyCol]);
        if (idx >= 0) table[idx] = { ...table[idx], ...payload };
        else table.push({ ...payload });
      } else if (pendingOp?.type === "update") {
        applyFilters(table).forEach((row) => Object.assign(row, pendingOp!.payload));
      } else if (pendingOp?.type === "delete") {
        const toDelete = new Set(applyFilters(table));
        tables[tableName] = table.filter((r) => !toDelete.has(r));
      }

      let result = applyFilters(getTable(tableName).slice());
      if (orderBy) {
        const { col, ascending } = orderBy;
        result = result.sort((a, b) => {
          if ((a[col] as string) < (b[col] as string)) return ascending ? -1 : 1;
          if ((a[col] as string) > (b[col] as string)) return ascending ? 1 : -1;
          return 0;
        });
      }

      if (single) return { data: result[0] ?? null, error: null };
      return { data: result, error: null };
    }

    const builder = {
      select() {
        return builder;
      },
      eq(col: string, val: unknown) {
        filters.push((row) => row[col] === val);
        return builder;
      },
      order(col: string, opts?: { ascending?: boolean }) {
        orderBy = { col, ascending: opts?.ascending ?? true };
        return builder;
      },
      insert(payload: Row) {
        pendingOp = { type: "insert", payload };
        return builder;
      },
      upsert(payload: Row) {
        pendingOp = { type: "upsert", payload };
        return builder;
      },
      update(payload: Row) {
        pendingOp = { type: "update", payload };
        return builder;
      },
      delete() {
        pendingOp = { type: "delete" };
        return builder;
      },
      maybeSingle() {
        return finalize(true);
      },
      then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
        return finalize(false).then(resolve, reject);
      },
    };

    return builder;
  }

  return {
    from(table: string) {
      return makeBuilder(table);
    },
    storage: {
      from(_bucket: string) {
        return {
          async upload(path: string, buffer: Buffer) {
            files[path] = buffer;
            return { data: { path }, error: null };
          },
          async remove(paths: string[]) {
            paths.forEach((p) => delete files[p]);
            return { data: null, error: null };
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `https://fake.supabase.co/storage/v1/object/public/media/${path}` } };
          },
        };
      },
    },
    __tables: tables,
    __files: files,
  };
}
