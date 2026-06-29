import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getFooterData } from "@/lib/footer.functions";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Github,
  MessageCircle,
  Globe,
} from "lucide-react";

const ICONS: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  "message-circle": MessageCircle,
};

type Data = Awaited<ReturnType<typeof getFooterData>>;

export function Footer() {
  const fn = useServerFn(getFooterData);
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    fn()
      .then(setData)
      .catch(() => {});
  }, [fn]);
  if (!data) return null;

  const year = new Date().getFullYear();
  const { brand, bottom, sections, links, legalPages } = data;

  function renderLink(href: string, label: string, newTab: boolean, icon?: string | null) {
    const Icon = icon ? (ICONS[icon] ?? Globe) : null;
    const inner = (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {label}
      </span>
    );
    if (newTab || /^https?:/i.test(href)) {
      return (
        <a
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {inner}
        </a>
      );
    }
    return <Link to={href as any}>{inner}</Link>;
  }

  return (
    <footer className="mt-16 border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            {brand.logo ? (
              <img src={brand.logo} alt="" className="h-8 w-8 rounded" />
            ) : (
              <div className="h-8 w-8 rounded bg-gradient-primary" />
            )}
            <span className="font-display text-lg font-semibold">{brand.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{brand.description}</p>
        </div>

        {sections.map((s) => {
          const sectionLinks = links.filter((l) => l.section_id === s.id);
          // Inject legal pages into the "legal" section automatically
          const extras =
            s.key === "legal"
              ? legalPages.map((p: any) => ({
                  id: `lp-${p.slug}`,
                  label: p.title,
                  href: `/legal/${p.slug}`,
                  open_in_new_tab: false,
                  icon: null,
                }))
              : [];
          const all = [...sectionLinks, ...extras];
          if (!all.length) return null;
          return (
            <div key={s.id}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">{s.title}</h3>
              <ul className="space-y-2">
                {all.map((l: any) => (
                  <li key={l.id}>{renderLink(l.href, l.label, !!l.open_in_new_tab, l.icon)}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <div>
            © {year} {bottom.company || brand.name}. {bottom.copyright}
          </div>
          <div className="flex items-center gap-3">
            {bottom.version ? <span>v{bottom.version}</span> : null}
            {bottom.build ? <span className="opacity-60">build {bottom.build}</span> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
