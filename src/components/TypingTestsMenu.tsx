import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listEnabledDurations } from "@/lib/test-durations.functions";

export function TypingTestsMenu({ triggerClassName }: { triggerClassName?: string }) {
  const fetchList = useServerFn(listEnabledDurations);
  const { data } = useQuery({
    queryKey: ["public-durations"],
    queryFn: () => fetchList(),
    staleTime: 60_000,
  });
  const items = data ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        }
      >
        <Clock className="h-3.5 w-3.5" /> Typing Tests{" "}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Choose a duration</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((d) => (
          <DropdownMenuItem key={d.id} asChild>
            <Link
              to="/typing-test/$slug"
              params={{ slug: d.slug }}
              className="flex w-full items-center justify-between"
            >
              <span>{d.nav_label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {d.seconds ? `${d.seconds}s` : "Custom"}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/typing-test">View all typing tests →</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
