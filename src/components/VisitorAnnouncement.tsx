import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { getActiveVisitorBanner } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";

export default function VisitorAnnouncement() {
  const getBannerFn = useServerFn(getActiveVisitorBanner);
  const location = useLocation();
  const [banner, setBanner] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const authed = !!data.session;
      setIsAuthed(authed);
      if (authed) {
        try {
          localStorage.setItem("ett-has-account", "true");
        } catch {}
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthed(authed);
      if (authed) {
        try {
          localStorage.setItem("ett-has-account", "true");
        } catch {}
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch active banner and evaluate conditions
  useEffect(() => {
    if (isAuthed === null) return; // Wait for auth check

    getBannerFn()
      .then((activeBanner) => {
        if (!activeBanner) {
          setIsOpen(false);
          return;
        }

        // 1. Never show if user is logged in
        if (isAuthed) {
          setIsOpen(false);
          return;
        }

        // 2. Never show if user has an account (stored in localStorage)
        try {
          if (localStorage.getItem("ett-has-account") === "true") {
            setIsOpen(false);
            return;
          }
        } catch {}

        // 3. Do not show if target audience doesn't match
        if (activeBanner.target_audience === "users") {
          // If banner is only for logged-in users, don't show to guests
          setIsOpen(false);
          return;
        }

        // 4. Do not show if dismissed in last 30 days
        try {
          const dismissedData = localStorage.getItem("ett-dismissed-visitor-banner");
          if (dismissedData) {
            const { id, dismissedAt } = JSON.parse(dismissedData);
            if (id === activeBanner.id) {
              const ageMs = Date.now() - dismissedAt;
              const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
              if (ageMs < thirtyDaysMs) {
                setIsOpen(false);
                return;
              }
            }
          }
        } catch {}

        // 5. Page match check
        const currentPath = location.pathname;
        const displayPages = activeBanner.display_pages || "all";
        if (displayPages === "homepage" && currentPath !== "/") {
          setIsOpen(false);
          return;
        }
        if (displayPages !== "all" && displayPages !== "homepage") {
          const paths = displayPages.split(",").map((p: string) => p.trim());
          if (!paths.includes(currentPath)) {
            setIsOpen(false);
            return;
          }
        }

        setBanner(activeBanner);
        setIsOpen(true);
      })
      .catch((err) => {
        console.error("Error loading visitor announcement:", err);
      });
  }, [getBannerFn, isAuthed, location.pathname]);

  const handleDismiss = () => {
    if (!banner) return;
    try {
      localStorage.setItem(
        "ett-dismissed-visitor-banner",
        JSON.stringify({
          id: banner.id,
          dismissedAt: Date.now(),
        })
      );
    } catch {}
    setIsOpen(false);
  };

  const handlePrimaryClick = () => {
    if (!banner) return;

    if (banner.primary_btn_action === "signup") {
      // Confetti effect!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Dismiss the banner
      handleDismiss();

      // Redirect after confetti splash
      setTimeout(() => {
        window.location.href = "/auth?mode=signup";
      }, 700);
    } else if (banner.primary_btn_action) {
      window.open(banner.primary_btn_action, "_blank");
    }
  };

  const handleSecondaryClick = () => {
    if (!banner) return;
    if (banner.secondary_btn_href) {
      window.open(banner.secondary_btn_href, "_blank");
    }
  };

  if (!isOpen || !banner) return null;

  // Custom Colors
  const customColors = banner.colors || {};
  const glassEffect = customColors.glassmorphism !== false;

  const cardStyle = {
    backgroundColor: customColors.bg || "rgba(10, 10, 15, 0.8)",
    color: customColors.text || "#ffffff",
    borderColor: customColors.border || "rgba(255, 255, 255, 0.1)",
    backdropFilter: glassEffect ? "blur(16px)" : "none",
    WebkitBackdropFilter: glassEffect ? "blur(16px)" : "none",
  };

  const primaryBtnStyle = {
    background: customColors.primaryBtnBg || "linear-gradient(135deg, #a21caf, #6366f1)",
    color: customColors.primaryBtnText || "#ffffff",
  };

  const secondaryBtnStyle = {
    backgroundColor: customColors.secondaryBtnBg || "rgba(255, 255, 255, 0.08)",
    color: customColors.secondaryBtnText || "#ffffff",
    borderColor: customColors.border || "rgba(255, 255, 255, 0.1)",
  };

  // Helper to parse description list items beautifully
  const renderDescription = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith("✅") || trimmed.startsWith("✨") || trimmed.startsWith("🎉") || trimmed.startsWith("🚀")) {
        const emoji = trimmed.slice(0, 2);
        const content = trimmed.slice(2).trim();
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 text-[13px] md:text-sm">
            <span className="text-base leading-none flex-shrink-0 mt-0.5">{emoji}</span>
            <span className="opacity-95 text-left">{content}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[13px] md:text-sm opacity-90 my-1 leading-relaxed text-left">
          {line}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center md:justify-end">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          style={cardStyle}
          className="w-full max-w-[480px] rounded-2xl border p-5 shadow-2xl pointer-events-auto flex flex-col gap-4 overflow-y-auto max-h-[85vh] md:max-h-[70vh] scrollbar-thin"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {banner.icon_url ? (
                <img
                  src={banner.icon_url}
                  alt="Icon"
                  className="h-10 w-10 rounded-lg object-contain flex-shrink-0 bg-white/5 p-1"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 text-primary-foreground shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
              <h3 className="font-semibold text-base md:text-lg tracking-tight text-left leading-tight">
                {banner.title}
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 flex-shrink-0"
              aria-label="Close Announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Banner Image */}
          {banner.image_url && (
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-black/20 border border-white/5">
              <img
                src={banner.image_url}
                alt="Banner Asset"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description / Bullet Points */}
          <div className="flex flex-col gap-0.5 text-left overflow-y-auto max-h-[30vh] pr-1 scrollbar-thin">
            {renderDescription(banner.description)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-2 w-full">
            <Button
              onClick={handlePrimaryClick}
              style={primaryBtnStyle}
              className="flex-1 font-medium shadow-lg hover:brightness-110 active:scale-[0.98] transition-all py-2.5 rounded-xl border-0 h-auto text-sm"
            >
              {banner.primary_btn_text}
            </Button>
            {banner.secondary_btn_text && (
              <Button
                variant="outline"
                onClick={handleSecondaryClick}
                style={secondaryBtnStyle}
                className="flex-1 font-medium hover:bg-white/5 active:scale-[0.98] transition-all py-2.5 rounded-xl h-auto text-sm border"
              >
                {banner.secondary_btn_text}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
