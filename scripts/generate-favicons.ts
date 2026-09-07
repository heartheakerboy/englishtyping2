import { PNG } from "pngjs";
import * as fs from "fs";
import * as path from "path";

// Helper for distance to rounded rectangle
function sdRoundBox(px: number, py: number, bx: number, by: number, r: number): number {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  return Math.min(Math.max(qx, qy), 0.0) + Math.hypot(Math.max(qx, 0.0), Math.max(qy, 0.0)) - r;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function renderFaviconPNG(size: number): Buffer {
  const png = new PNG({ width: size, height: size });
  const half = size / 2;
  const cornerRadius = size * 0.22;
  const boxHalf = half - 1; // 1px margin

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const px = x - half + 0.5;
      const py = y - half + 0.5;

      // Distance to outer rounded rect
      const dOuter = sdRoundBox(px, py, boxHalf, boxHalf, cornerRadius);

      if (dOuter > 0.5) {
        // Transparent outside
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        continue;
      }

      // Smooth edge antialiasing
      const alphaOuter = clamp(0.5 - dOuter, 0, 1);

      // Background Gradient from #8b5cf6 (top-left) to #4f46e5 (bottom-right)
      const gradT = clamp((x + y) / (size * 2), 0, 1);
      let r = Math.round(139 + (79 - 139) * gradT);
      let g = Math.round(92 + (70 - 92) * gradT);
      let b = Math.round(246 + (229 - 246) * gradT);
      let a = alphaOuter * 255;

      // Subtle inner rim highlight (top/left lighter)
      if (dOuter > -1.5 && dOuter <= 0.5) {
        const rimStrength = clamp(0.35 * (1.0 - (y / size)), 0, 0.4);
        r = Math.round(r + (255 - r) * rimStrength);
        g = Math.round(g + (255 - g) * rimStrength);
        b = Math.round(b + (255 - b) * rimStrength);
      }

      // Keyboard Area
      // Outer keyboard shell: centered, width ~ 66%, height ~ 48%
      const kbHalfW = size * 0.33;
      const kbHalfH = size * 0.24;
      const kbCenterY = 0;
      const dKb = sdRoundBox(px, py - kbCenterY, kbHalfW, kbHalfH, size * 0.07);

      if (dKb < 0) {
        // Inside keyboard container
        const kbInnerAlpha = clamp(-dKb, 0, 1);
        r = Math.round(r * (1 - 0.35 * kbInnerAlpha) + 15 * 0.35 * kbInnerAlpha);
        g = Math.round(g * (1 - 0.35 * kbInnerAlpha) + 23 * 0.35 * kbInnerAlpha);
        b = Math.round(b * (1 - 0.35 * kbInnerAlpha) + 42 * 0.35 * kbInnerAlpha);

        // Keycaps coordinates
        // Row 1 keys: y from -0.16 to -0.06
        // Row 2 keys: y from -0.03 to 0.07
        // Row 3 keys: y from 0.10 to 0.20
        const kH = size * 0.055;
        const kRad = size * 0.02;

        // Check Row 1 (5 keys)
        const r1Y = -size * 0.11;
        const r2Y = 0;
        const r3Y = size * 0.11;

        // Row 1: 5 keys evenly spaced
        const r1Xs = [-size * 0.24, -size * 0.12, 0, size * 0.12, size * 0.24];
        let onKey = false;
        let isAccent = false;

        for (const kx of r1Xs) {
          const dKey = sdRoundBox(px - kx, py - r1Y, size * 0.045, kH, kRad);
          if (dKey < 0.2) {
            onKey = true;
            break;
          }
        }

        // Row 2: 5 keys, last one is accent key (cyan)
        if (!onKey) {
          const r2Xs = [-size * 0.24, -size * 0.12, 0, size * 0.12, size * 0.24];
          for (let ki = 0; ki < r2Xs.length; ki++) {
            const kx = r2Xs[ki];
            const dKey = sdRoundBox(px - kx, py - r2Y, size * 0.045, kH, kRad);
            if (dKey < 0.2) {
              onKey = true;
              if (ki === 4) isAccent = true;
              break;
            }
          }
        }

        // Row 3: 3 keys (side key, spacebar, side key)
        if (!onKey) {
          // Left key
          const dLeft = sdRoundBox(px - (-size * 0.22), py - r3Y, size * 0.06, kH, kRad);
          // Spacebar
          const dSpace = sdRoundBox(px, py - r3Y, size * 0.12, kH, kRad);
          // Right key
          const dRight = sdRoundBox(px - (size * 0.22), py - r3Y, size * 0.06, kH, kRad);

          if (dLeft < 0.2 || dSpace < 0.2 || dRight < 0.2) {
            onKey = true;
          }
        }

        if (onKey) {
          if (isAccent) {
            // Cyan accent key
            r = 56;
            g = 189;
            b = 248;
          } else {
            // Crisp clean white keycap
            r = 255;
            g = 255;
            b = 255;
          }
        }
      }

      // Small cyan lightning dot/spark on top-right (typing speed accent)
      const sparkX = size * 0.32;
      const sparkY = -size * 0.32;
      const dSpark = Math.hypot(px - sparkX, py - sparkY) - size * 0.055;
      if (dSpark < 0.5) {
        const sAlpha = clamp(0.5 - dSpark, 0, 1);
        r = Math.round(r * (1 - sAlpha) + 56 * sAlpha);
        g = Math.round(g * (1 - sAlpha) + 189 * sAlpha);
        b = Math.round(b * (1 - sAlpha) + 248 * sAlpha);
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = Math.round(a);
    }
  }

  return PNG.sync.write(png);
}

// Function to create multi-image ICO buffer
function createIco(images: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const entries: Buffer[] = [];
  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette (0 for truecolor)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset to image data
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

async function main() {
  const publicDir = path.resolve(process.cwd(), "public");

  console.log("Generating favicons in:", publicDir);

  // 1. Generate PNGs at multiple sizes
  const sizes = [16, 32, 48, 180, 192, 512];
  const pngBuffers: Record<number, Buffer> = {};

  for (const s of sizes) {
    console.log(`Rendering ${s}x${s}...`);
    pngBuffers[s] = renderFaviconPNG(s);
  }

  // 2. Save PNG files
  fs.writeFileSync(path.join(publicDir, "favicon-16x16.png"), pngBuffers[16]);
  fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), pngBuffers[32]);
  fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), pngBuffers[180]);
  fs.writeFileSync(path.join(publicDir, "icon-192.png"), pngBuffers[192]);
  fs.writeFileSync(path.join(publicDir, "icon-512.png"), pngBuffers[512]);
  console.log("Saved PNG favicons & app icons.");

  // 3. Generate multi-resolution favicon.ico (16, 32, 48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: pngBuffers[16] },
    { width: 32, height: 32, buffer: pngBuffers[32] },
    { width: 48, height: 48, buffer: pngBuffers[48] },
  ]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  console.log("Saved multi-size favicon.ico (16x16, 32x32, 48x48)!");
}

main().catch(console.error);
