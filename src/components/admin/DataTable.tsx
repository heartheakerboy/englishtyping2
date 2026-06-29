import { type ReactNode, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortBy?: (row: T) => string | number;
  className?: string;
};

export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  search,
  searchFields,
  actions,
  emptyLabel = "No records.",
  initialSort,
  onBulkAction,
  bulkActions,
}: {
  rows: T[];
  columns: Column<T>[];
  search?: boolean;
  searchFields?: (keyof T)[];
  actions?: (row: T) => ReactNode;
  emptyLabel?: string;
  initialSort?: { key: string; desc?: boolean };
  bulkActions?: Array<{
    label: string;
    onRun: (ids: Array<T["id"]>) => void;
    destructive?: boolean;
  }>;
  onBulkAction?: (ids: Array<T["id"]>) => void;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(
    initialSort ? { key: initialSort.key, desc: !!initialSort.desc } : null,
  );
  const [selected, setSelected] = useState<Set<T["id"]>>(new Set());

  const filtered = useMemo(() => {
    let out = rows;
    if (q && searchFields?.length) {
      const term = q.toLowerCase();
      out = out.filter((r) =>
        searchFields.some((f) =>
          String((r as any)[f] ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortBy) {
        out = [...out].sort((a, b) => {
          const av = col.sortBy!(a),
            bv = col.sortBy!(b);
          if (av < bv) return sort.desc ? 1 : -1;
          if (av > bv) return sort.desc ? -1 : 1;
          return 0;
        });
      }
    }
    return out;
  }, [rows, q, sort, columns, searchFields]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };
  const toggle = (id: T["id"]) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  return (
    <div className="space-y-3">
      {(search || bulkActions?.length) && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="max-w-xs"
              aria-label="Search rows"
            />
          )}
          {selected.size > 0 && bulkActions?.length ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              {bulkActions.map((b, i) => (
                <button
                  key={i}
                  onClick={() => {
                    b.onRun([...selected]);
                    setSelected(new Set());
                    onBulkAction?.([...selected]);
                  }}
                  className={`rounded-md border px-2.5 py-1 text-xs ${b.destructive ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border hover:bg-surface-elevated"}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "row" : "rows"}
          </div>
        </div>
      )}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
              <tr>
                {bulkActions?.length ? (
                  <th className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                    />
                  </th>
                ) : null}
                {columns.map((c) => (
                  <th key={c.key} className={`text-left p-3 ${c.className ?? ""}`}>
                    {c.sortBy ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={() =>
                          setSort((s) =>
                            s?.key === c.key
                              ? { key: c.key, desc: !s.desc }
                              : { key: c.key, desc: false },
                          )
                        }
                      >
                        {c.header}
                        {sort?.key === c.key ? (
                          <span aria-hidden>{sort.desc ? "↓" : "↑"}</span>
                        ) : null}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))}
                {actions ? <th className="text-right p-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} className="border-t border-border/40 align-middle">
                  {bulkActions?.length ? (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row.id)}
                      />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.key} className={`p-3 ${c.className ?? ""}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="p-3 text-right whitespace-nowrap">{actions(row)}</td>
                  ) : null}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0) + (bulkActions?.length ? 1 : 0)}
                    className="p-6 text-center text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
