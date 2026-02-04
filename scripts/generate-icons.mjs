import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceImage = join(rootDir, 'public/assets/logo.png');
const outputDir = join(rootDir, 'public/icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  // Generar iconos PWA en diferentes tamaños
  for (const size of sizes) {
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(join(outputDir, `icon-${size}x${size}.png`));

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(sourceImage)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile(join(outputDir, 'apple-touch-icon.png'));

  console.log('✓ Generated apple-touch-icon.png');

  // Shortcut icons (96x96) - usando el mismo logo
  await sharp(sourceImage)
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile(join(outputDir, 'shortcut-routine.png'));

  await sharp(sourceImage)
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile(join(outputDir, 'shortcut-checkin.png'));

  console.log('✓ Generated shortcut icons');

  console.log('\n✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
