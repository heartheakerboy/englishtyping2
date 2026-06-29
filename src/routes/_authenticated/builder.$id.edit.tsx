import { createFileRoute, useParams } from "@tanstack/react-router";
import { TestBuilderWizard } from "@/components/builder/TestBuilderWizard";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/_authenticated/builder/$id/edit")({
  component: EditPage,
});

function EditPage() {
  const { id } = useParams({ from: "/_authenticated/builder/$id/edit" });
  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <TestBuilderWizard editId={id} />
      </div>
    </>
  );
}
