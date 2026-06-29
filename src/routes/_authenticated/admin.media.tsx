import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { listMedia, uploadMedia, deleteMedia } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Copy, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/media")({ component: MediaPage });

function MediaPage() {
  const list = useServerFn(listMedia);
  const upload = useServerFn(uploadMedia);
  const del = useServerFn(deleteMedia);
  const { data, refetch } = useQuery({ queryKey: ["admin-media"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState("uploads");
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      try {
        const buf = await f.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        await upload({
          data: {
            filename: f.name,
            mime_type: f.type || "application/octet-stream",
            data_base64: b64,
            folder,
          },
        });
      } catch (e: any) {
        toast.error(`${f.name}: ${e.message}`);
      }
    }
    setBusy(false);
    toast.success("Uploaded");
    refetch();
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this asset?")) return;
    try {
      await del({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const rows = (data ?? []).filter(
    (m: any) =>
      !q ||
      m.filename.toLowerCase().includes(q.toLowerCase()) ||
      (m.alt ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Images, icons, audio and assets. Max 8 MB each.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-44"
          />
          <Input
            placeholder="folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-32"
          />
          <Button onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload className="mr-1 h-4 w-4" />
            {busy ? "Uploading…" : "Upload"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((m: any) => (
          <Card key={m.id} className="overflow-hidden">
            <div className="aspect-square bg-surface-elevated">
              {m.mime_type?.startsWith("image/") ? (
                <img
                  src={m.url}
                  alt={m.alt ?? m.filename}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  {m.mime_type}
                </div>
              )}
            </div>
            <div className="p-2 text-xs">
              <div className="truncate font-medium" title={m.filename}>
                {m.filename}
              </div>
              <div className="text-muted-foreground">
                {m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : ""}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(m.url);
                    toast.success("URL copied");
                  }}
                  className="rounded p-1 hover:bg-surface-elevated"
                  title="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(m.id)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {!rows.length && (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground">
            No assets yet.
          </div>
        )}
      </div>
    </div>
  );
}
