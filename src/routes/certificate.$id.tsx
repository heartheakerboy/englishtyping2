import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { getCertificate } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, Award } from "lucide-react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/certificate/$id")({
  loader: async ({ params }) => {
    const cert = await getCertificate({ data: { id: params.id } });
    if (!cert) throw notFound();
    return cert;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Certificate ${loaderData.id} — englishtypingtest.org` },
          {
            name: "description",
            content: `${loaderData.display_name} typed at ${Number(loaderData.wpm).toFixed(0)} WPM with ${Number(loaderData.accuracy).toFixed(1)}% accuracy.`,
          },
          {
            property: "og:title",
            content: `Typing Certificate — ${Number(loaderData.wpm).toFixed(0)} WPM`,
          },
        ]
      : [],
  }),
  errorComponent: NotFoundView,
  notFoundComponent: NotFoundView,
  component: CertificatePage,
});

function NotFoundView() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-xl px-6 pt-24 pb-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Certificate not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Double-check the certificate ID.</p>
        <Button asChild className="mt-6">
          <Link to="/">Go home</Link>
        </Button>
      </main>
    </div>
  );
}

function CertificatePage() {
  const cert = Route.useLoaderData();
  const [qrUrl, setQrUrl] = useState<string>("");
  const verifyUrl =
    typeof window !== "undefined" ? `${window.location.origin}/certificate/${cert.id}` : "";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0a0a0f", light: "#ffffff" },
    }).then(setQrUrl);
  }, [verifyUrl]);

  const downloadPDF = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, w, h, "F");

    // Border
    doc.setDrawColor(124, 92, 255);
    doc.setLineWidth(2);
    doc.rect(28, 28, w - 56, h - 56);
    doc.setLineWidth(0.5);
    doc.rect(36, 36, w - 72, h - 72);

    doc.setTextColor(226, 226, 232);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ENGLISHTYPINGTEST.ORG", w / 2, 80, { align: "center" });

    doc.setFontSize(36);
    doc.text("Certificate of Typing Achievement", w / 2, 140, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("This is to certify that", w / 2, 185, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(124, 92, 255);
    doc.setFontSize(40);
    doc.text(cert.display_name, w / 2, 240, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(226, 226, 232);
    doc.setFontSize(14);
    doc.text(
      `achieved ${Number(cert.wpm).toFixed(0)} WPM with ${Number(cert.accuracy).toFixed(1)}% accuracy`,
      w / 2,
      280,
      { align: "center" },
    );
    doc.text(`on a ${cert.mode} ${cert.mode_value} test in ${cert.language}`, w / 2, 302, {
      align: "center",
    });

    // Stats row
    const y = 360;
    drawStat(doc, w / 2 - 200, y, "WPM", Number(cert.wpm).toFixed(0));
    drawStat(doc, w / 2 - 60, y, "ACCURACY", `${Number(cert.accuracy).toFixed(1)}%`);
    drawStat(doc, w / 2 + 80, y, "CPM", Number(cert.cpm).toFixed(0));

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(160, 160, 175);
    doc.text(`Certificate ID: ${cert.id}`, 60, h - 60);
    doc.text(`Issued: ${new Date(cert.issued_at).toLocaleDateString()}`, 60, h - 44);
    doc.text(`Verify: ${verifyUrl}`, 60, h - 28);

    // QR
    if (qrUrl) {
      doc.addImage(qrUrl, "PNG", w - 140, h - 140, 80, 80);
    }

    doc.save(`typing-certificate-${cert.id}.pdf`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified certificate
          </div>
          <Button
            onClick={downloadPDF}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        <Card
          ref={ref}
          className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-background via-surface to-background p-10 shadow-glow"
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, oklch(0.68 0.22 290 / 0.3), transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.78 0.18 195 / 0.2), transparent 50%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                englishtypingtest.org
              </span>
              <Award className="h-8 w-8 text-primary" />
            </div>

            <h1 className="mt-8 text-center font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Certificate of Typing Achievement
            </h1>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              This is to certify that
            </p>
            <p className="mt-3 text-center font-display text-4xl font-bold text-gradient md:text-5xl">
              {cert.display_name}
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              achieved a typing speed of{" "}
              <span className="font-semibold text-foreground">
                {Number(cert.wpm).toFixed(0)} WPM
              </span>{" "}
              with{" "}
              <span className="font-semibold text-foreground">
                {Number(cert.accuracy).toFixed(1)}%
              </span>{" "}
              accuracy
              <br />
              on a{" "}
              <span className="font-mono text-foreground">
                {cert.mode} {cert.mode_value}
              </span>{" "}
              test in {cert.language}.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <BigStat label="WPM" value={Number(cert.wpm).toFixed(0)} />
              <BigStat label="Accuracy" value={`${Number(cert.accuracy).toFixed(1)}%`} />
              <BigStat label="CPM" value={Number(cert.cpm).toFixed(0)} />
            </div>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-border/60 pt-6">
              <div className="text-xs text-muted-foreground">
                <div>Certificate ID</div>
                <div className="mt-0.5 font-mono text-sm text-foreground">{cert.id}</div>
                <div className="mt-3">Issued</div>
                <div className="mt-0.5 font-mono text-sm text-foreground">
                  {new Date(cert.issued_at).toLocaleDateString()}
                </div>
              </div>
              {qrUrl && (
                <div className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                  <img
                    src={qrUrl}
                    alt="Verify"
                    className="rounded bg-white p-1.5"
                    width={100}
                    height={100}
                  />
                  <div className="mt-1">Scan to verify</div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/40 p-4 text-center backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-primary">
        {value}
      </div>
    </div>
  );
}

function drawStat(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 175);
  doc.text(label, x + 60, y, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(124, 92, 255);
  doc.text(value, x + 60, y + 30, { align: "center" });
}
