import { sql } from "../src/lib/db";

const TEMPLATES = [
  {
    name: "Classic Executive",
    description: "A traditional, academic certificate design with elegant borders and classic serif typography.",
    template: {
      layout: "classic",
      color: "#7c3aed",
      borderColor: "#7c3aed",
      fontFamily: "serif",
      background: "dark"
    },
    preview_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    is_default: true,
  },
  {
    name: "Modern Cyan",
    description: "Clean, minimalist styling with vibrant cyan details and sleek geometric layouts.",
    template: {
      layout: "modern",
      color: "#06b6d4",
      borderColor: "#0891b2",
      fontFamily: "sans-serif",
      background: "dark"
    },
    preview_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    is_default: false,
  },
  {
    name: "Neon Cyberpunk",
    description: "High-contrast neon pink and purple borders with futuristic digital monospace typography.",
    template: {
      layout: "cyberpunk",
      color: "#ec4899",
      borderColor: "#c084fc",
      fontFamily: "monospace",
      background: "dark"
    },
    preview_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    is_default: false,
  },
  {
    name: "Golden Elite",
    description: "Premium gold theme designed for top performers and typing speeds exceeding 100+ WPM.",
    template: {
      layout: "gold",
      color: "#fbbf24",
      borderColor: "#d97706",
      fontFamily: "serif",
      background: "dark"
    },
    preview_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    is_default: false,
  },
  {
    name: "Retro Terminal",
    description: "An old-school command line interface terminal design with amber text and scan lines.",
    template: {
      layout: "retro",
      color: "#f59e0b",
      borderColor: "#b45309",
      fontFamily: "monospace",
      background: "terminal"
    },
    preview_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    is_default: false,
  },
];

async function main() {
  console.log("Seeding certificate templates into database...");
  for (const t of TEMPLATES) {
    try {
      const existing = await sql`
        SELECT id FROM certificate_templates WHERE name = ${t.name}
      `;
      if (existing.length > 0) {
        console.log(`Template ${t.name} already exists, skipping.`);
      } else {
        await sql`
          INSERT INTO certificate_templates (name, description, template, preview_url, is_active, is_default)
          VALUES (${t.name}, ${t.description}, ${t.template}, ${t.preview_url}, ${t.is_active}, ${t.is_default})
        `;
        console.log(`Template ${t.name} seeded successfully.`);
      }
    } catch (e: any) {
      console.error(`Error seeding ${t.name}:`, e.message || e);
    }
  }
  console.log("Done.");
  process.exit(0);
}

main();
