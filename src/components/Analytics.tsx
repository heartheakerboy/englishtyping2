import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSettings } from "@/lib/cms.functions";

/** Loads GA / Clarity / Plausible scripts only after mount, only if IDs are configured. */
export function Analytics() {
  const fn = useServerFn(getPublicSettings);
  const [ids, setIds] = useState<{
    ga_id?: string;
    clarity_id?: string;
    plausible_domain?: string;
  } | null>(null);

  useEffect(() => {
    fn()
      .then((s: any) => setIds(s?.analytics ?? {}))
      .catch(() => setIds({}));
  }, [fn]);

  useEffect(() => {
    if (!ids) return;
    if (ids.ga_id) {
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${ids.ga_id}`;
      document.head.appendChild(s1);
      const s2 = document.createElement("script");
      s2.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ids.ga_id}');`;
      document.head.appendChild(s2);
    }
    if (ids.clarity_id) {
      const s = document.createElement("script");
      s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${ids.clarity_id}");`;
      document.head.appendChild(s);
    }
    if (ids.plausible_domain) {
      const s = document.createElement("script");
      s.defer = true;
      s.setAttribute("data-domain", ids.plausible_domain);
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }
  }, [ids]);

  return null;
}
