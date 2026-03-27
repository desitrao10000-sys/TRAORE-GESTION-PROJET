import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const inputPath = path.join(process.cwd(), 'public/icons/icon-512x512.png');
const outputDir = path.join(process.cwd(), 'public/icons');

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');
  
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Image source non trouvée:', inputPath);
    process.exit(1);
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 245, g: 158, b: 11, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size} -> ${outputPath}`);
    } catch (error) {
      console.error(`❌ Erreur ${size}x${size}:`, error);
    }
  }

  // Also create favicon
  const faviconPath = path.join(process.cwd(), 'public/favicon.ico');
  try {
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(process.cwd(), 'public/icons/icon-32x32.png'));
    
    await sharp(inputPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(process.cwd(), 'public/icons/icon-16x16.png'));
    
    console.log(`\n✅ Icônes favicon générées`);
  } catch (error) {
    console.error('❌ Erreur favicon:', error);
  }

  console.log('\n🎉 Génération terminée !');
}

generateIcons();
