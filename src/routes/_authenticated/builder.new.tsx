import { createFileRoute } from "@tanstack/react-router";
import { TestBuilderWizard } from "@/components/builder/TestBuilderWizard";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/_authenticated/builder/new")({
  component: () => (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <TestBuilderWizard />
      </div>
    </>
  ),
  head: () => ({ meta: [{ title: "New Test — Builder" }] }),
});
