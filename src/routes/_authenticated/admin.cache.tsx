import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clearServerCache } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Trash2,
  Database,
  HardDrive,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Zap,
  Layers,
  Globe,
  Activity,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cache")({ component: CachePage });

function CachePage() {
  const queryClient = useQueryClient();
  const serverClear = useServerFn(clearServerCache);

  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [queryCount, setQueryCount] = useState<number>(0);
  const [storageSize, setStorageSize] = useState<{ local: string; session: string }>({
    local: "0 KB",
    session: "0 KB",
  });
  const [cacheApiCount, setCacheApiCount] = useState<number>(0);
  const [lastCleared, setLastCleared] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ type: string; timestamp: string; status: "success" | "failed" }>
  >([]);

  // Calculate live cache statistics
  const updateStats = async () => {
    // 1. Query Cache Count
    const queries = queryClient.getQueryCache().getAll();
    setQueryCount(queries.length);

    // 2. Storage Sizes
    try {
      let localBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) localBytes += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
      }
      let sessionBytes = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k) sessionBytes += (k.length + (sessionStorage.getItem(k)?.length || 0)) * 2;
      }
      setStorageSize({
        local: (localBytes / 1024).toFixed(1) + " KB",
        session: (sessionBytes / 1024).toFixed(1) + " KB",
      });
    } catch {
      setStorageSize({ local: "N/A", session: "N/A" });
    }

    // 3. CacheStorage API Count
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        setCacheApiCount(keys.length);
      }
    } catch {
      setCacheApiCount(0);
    }
  };

  useEffect(() => {
    updateStats();
  }, []);

  const addHistory = (type: string, status: "success" | "failed") => {
    const entry = { type, timestamp: new Date().toLocaleTimeString(), status };
    setHistory((prev) => [entry, ...prev.slice(0, 9)]);
  };

  // Actions
  const handleClearQueryCache = async () => {
    setLoadingType("query");
    try {
      queryClient.clear();
      await queryClient.invalidateQueries();
      await updateStats();
      toast.success("Query cache cleared and refreshed");
      addHistory("Query Cache", "success");
    } catch (e: any) {
      toast.error("Failed to clear query cache: " + e.message);
      addHistory("Query Cache", "failed");
    } finally {
      setLoadingType(null);
    }
  };

  const handleClearStorage = async () => {
    setLoadingType("storage");
    try {
      // Preserve auth tokens (keys with 'sb-' or 'supabase')
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.includes("supabase") && !key.startsWith("sb-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      await updateStats();
      toast.success("Local & Session storage cache cleared");
      addHistory("Browser Storage", "success");
    } catch (e: any) {
      toast.error("Failed to clear storage: " + e.message);
      addHistory("Browser Storage", "failed");
    } finally {
      setLoadingType(null);
    }
  };

  const handleClearBrowserCacheApi = async () => {
    setLoadingType("browser");
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      await updateStats();
      toast.success("Browser CacheStorage & Assets cleared");
      addHistory("CacheStorage API", "success");
    } catch (e: any) {
      toast.error("Failed to clear browser cache API: " + e.message);
      addHistory("CacheStorage API", "failed");
    } finally {
      setLoadingType(null);
    }
  };

  const handleClearServerCache = async () => {
    setLoadingType("server");
    try {
      const res = await serverClear({ data: { cacheType: "all" } });
      setLastCleared(new Date(res.timestamp).toLocaleTimeString());
      toast.success(res.message || "Server cache cleared successfully");
      addHistory("Server CMS Cache", "success");
    } catch (e: any) {
      toast.error("Failed to clear server cache: " + e.message);
      addHistory("Server CMS Cache", "failed");
    } finally {
      setLoadingType(null);
    }
  };

  const handleClearAll = async () => {
    setLoadingType("all");
    try {
      // Execute all clear routines
      queryClient.clear();
      await queryClient.invalidateQueries();

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.includes("supabase") && !key.startsWith("sb-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      const res = await serverClear({ data: { cacheType: "all" } });
      setLastCleared(new Date(res.timestamp).toLocaleTimeString());

      await updateStats();
      toast.success("🔥 All application & server caches cleared successfully!");
      addHistory("FULL PURGE (ALL)", "success");
    } catch (e: any) {
      toast.error("Error during full cache purge: " + e.message);
      addHistory("FULL PURGE (ALL)", "failed");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Cache & Performance Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and purge React Query, browser storage, asset cache, and server-side state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateStats}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Stats
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAll}
            disabled={loadingType !== null}
            className="flex items-center gap-1.5 shadow-sm"
          >
            {loadingType === "all" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Purge All Caches
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-border/80 bg-surface">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Query Cache (React Query)</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{queryCount}</div>
          <p className="text-xs text-muted-foreground">Active in-memory data queries</p>
        </Card>

        <Card className="p-4 space-y-2 border-border/80 bg-surface">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Browser Storage</span>
            <HardDrive className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{storageSize.local}</div>
          <p className="text-xs text-muted-foreground">
            LocalStorage: {storageSize.local} | Session: {storageSize.session}
          </p>
        </Card>

        <Card className="p-4 space-y-2 border-border/80 bg-surface">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>CacheStorage API</span>
            <Globe className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{cacheApiCount}</div>
          <p className="text-xs text-muted-foreground">Service worker & static asset caches</p>
        </Card>

        <Card className="p-4 space-y-2 border-border/80 bg-surface">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Server CMS Cache</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {lastCleared ? lastCleared : "Active"}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastCleared ? `Last cleared at ${lastCleared}` : "Ready to clear"}
          </p>
        </Card>
      </div>

      {/* Individual Cache Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* React Query Cache Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" /> React Query Cache
              </h3>
              <p className="text-xs text-muted-foreground">
                In-memory client state for fetched tests, leaderboards, blog posts, and settings.
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
              {queryCount} items
            </span>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearQueryCache}
              disabled={loadingType !== null}
              className="flex items-center gap-1.5"
            >
              {loadingType === "query" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Clear Query Cache
            </Button>
          </div>
        </Card>

        {/* Local Storage & Session Storage Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-emerald-500" /> Storage Cache
              </h3>
              <p className="text-xs text-muted-foreground">
                Clears client preferences, layout settings, and temporary drafts (auth tokens are safe).
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
              {storageSize.local}
            </span>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearStorage}
              disabled={loadingType !== null}
              className="flex items-center gap-1.5"
            >
              {loadingType === "storage" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Storage Cache
            </Button>
          </div>
        </Card>

        {/* CacheStorage API Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" /> Asset & Service Worker Cache
              </h3>
              <p className="text-xs text-muted-foreground">
                Clears browser HTTP caches, Service Worker assets, and offline PWA resources.
              </p>
            </div>
            <span className="text-xs font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
              {cacheApiCount} caches
            </span>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearBrowserCacheApi}
              disabled={loadingType !== null}
              className="flex items-center gap-1.5"
            >
              {loadingType === "browser" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Clear Asset Cache
            </Button>
          </div>
        </Card>

        {/* Server & CMS Cache Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Server & CMS Cache
              </h3>
              <p className="text-xs text-muted-foreground">
                Triggers server-side cache invalidation for CMS content, features, and logs audit event.
              </p>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded">
              Server API
            </span>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearServerCache}
              disabled={loadingType !== null}
              className="flex items-center gap-1.5"
            >
              {loadingType === "server" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Clear Server Cache
            </Button>
          </div>
        </Card>
      </div>

      {/* Master Purge Banner */}
      <Card className="p-6 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-red-500" /> Master Cache Purge
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Clears all client query data, browser storage caches, service worker assets, and server CMS caches simultaneously. Recommended after major updates or database migrations.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleClearAll}
          disabled={loadingType !== null}
          className="flex items-center gap-2 shrink-0 shadow-md"
        >
          {loadingType === "all" ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Purge All Caches Now
        </Button>
      </Card>

      {/* Action History Log */}
      {history.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent Cache Clearing Activity
          </h3>
          <div className="divide-y divide-border/40 text-xs">
            {history.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">cleared</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
