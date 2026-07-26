import { sql } from "../src/lib/db";

const BADGES = [
  {
    code: "speed-demon",
    name: "Speed Demon",
    description: "Achieve a typing speed of over 100 WPM on a typing test.",
    rarity: "epic",
    color: "#e11d48",
    xp_reward: 500,
    coin_reward: 100,
    is_active: true,
  },
  {
    code: "typing-god",
    name: "Typing God",
    description: "Break the sound barrier with a speed of over 150 WPM.",
    rarity: "legendary",
    color: "#f59e0b",
    xp_reward: 1500,
    coin_reward: 500,
    is_active: true,
  },
  {
    code: "laser-accuracy",
    name: "Laser Accuracy",
    description: "Complete a typing test of at least 30 words with perfect 100% accuracy.",
    rarity: "rare",
    color: "#06b6d4",
    xp_reward: 250,
    coin_reward: 50,
    is_active: true,
  },
  {
    code: "consistent-typist",
    name: "Consistent Typist",
    description: "Develop a daily habit. Complete 10 typing tests.",
    rarity: "common",
    color: "#10b981",
    xp_reward: 100,
    coin_reward: 20,
    is_active: true,
  },
  {
    code: "night-owl",
    name: "Night Owl",
    description: "Burn the midnight oil. Practice typing in the early hours of the morning.",
    rarity: "common",
    color: "#8b5cf6",
    xp_reward: 100,
    coin_reward: 20,
    is_active: true,
  },
  {
    code: "marathoner",
    name: "Marathoner",
    description: "Endure a typing session of 10 minutes or more.",
    rarity: "rare",
    color: "#3b82f6",
    xp_reward: 300,
    coin_reward: 75,
    is_active: true,
  },
  {
    code: "code-warrior",
    name: "Code Warrior",
    description: "Successfully complete a typing test in Code mode.",
    rarity: "epic",
    color: "#14b8a6",
    xp_reward: 400,
    coin_reward: 80,
    is_active: true,
  },
  {
    code: "keyboard-master",
    name: "Keyboard Master",
    description: "Try your hand at every single typing discipline.",
    rarity: "epic",
    color: "#ec4899",
    xp_reward: 600,
    coin_reward: 150,
    is_active: true,
  },
];

async function main() {
  console.log("Seeding badges into database...");
  for (const b of BADGES) {
    try {
      const existing = await sql`
        SELECT id FROM badges WHERE code = ${b.code}
      `;
      if (existing.length > 0) {
        console.log(`Badge ${b.code} already exists, skipping.`);
      } else {
        await sql`
          INSERT INTO badges (code, name, description, rarity, color, xp_reward, coin_reward, is_active)
          VALUES (${b.code}, ${b.name}, ${b.description}, ${b.rarity}, ${b.color}, ${b.xp_reward}, ${b.coin_reward}, ${b.is_active})
        `;
        console.log(`Badge ${b.code} seeded successfully.`);
      }
    } catch (e: any) {
      console.error(`Error seeding ${b.code}:`, e.message || e);
    }
  }
  console.log("Done.");
  process.exit(0);
}

main();
