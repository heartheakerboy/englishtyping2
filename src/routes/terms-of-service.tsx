import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  beforeLoad: () => {
    throw redirect({ to: "/terms", statusCode: 301 });
  },
  component: () => null,
});
