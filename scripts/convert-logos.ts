import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logos = [
  { name: 'logo1-bracket', svg: 'logo1-bracket.svg', png: 'logo1-bracket.png' },
  { name: 'logo7-infinite', svg: 'logo7-infinite.svg', png: 'logo7-infinite.png' },
  { name: 'logo8-pixel', svg: 'logo8-pixel.svg', png: 'logo8-pixel.png' },
];

async function convert() {
  for (const logo of logos) {
    const svgPath = path.join(__dirname, '../public', logo.svg);
    const pngPath = path.join(__dirname, '../public', logo.png);
    
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    
    console.log(`Converted: ${logo.png}`);
  }
  console.log('All done!');
}

convert().catch(console.error);
