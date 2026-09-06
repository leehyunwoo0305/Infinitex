import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icon.svg');
const pngPath = path.join(__dirname, '../public/icon.png');
const icoPath = path.join(__dirname, '../public/icon.ico');

async function convertIcon() {
  console.log('Converting SVG to PNG...');
  
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(pngPath);
  
  console.log(`PNG saved: ${pngPath}`);
  
  const icoImages = [];
  
  for (const size of sizes) {
    const buffer = await sharp(svgPath)
      .resize(size, size)
      .png()
      .toBuffer();
    
    icoImages.push({ size, buffer });
  }
  
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(icoImages.length, 4);
  
  const icoDir = Buffer.alloc(icoImages.length * 16);
  let dataOffset = 6 + (icoImages.length * 16);
  
  icoImages.forEach((img, i) => {
    const offset = i * 16;
    const w = img.size >= 256 ? 0 : img.size;
    const h = img.size >= 256 ? 0 : img.size;
    icoDir.writeUInt8(w, offset);
    icoDir.writeUInt8(h, offset + 1);
    icoDir.writeUInt8(0, offset + 2);
    icoDir.writeUInt8(0, offset + 3);
    icoDir.writeUInt16LE(1, offset + 4);
    icoDir.writeUInt16LE(32, offset + 6);
    icoDir.writeUInt32LE(img.buffer.length, offset + 8);
    icoDir.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += img.buffer.length;
  });
  
  const icoBuffer = Buffer.concat([
    icoHeader,
    icoDir,
    ...icoImages.map(img => img.buffer),
  ]);
  
  const fs = await import('fs');
  fs.writeFileSync(icoPath, icoBuffer);
  
  console.log(`ICO saved: ${icoPath}`);
  console.log('Icon conversion complete!');
}

convertIcon().catch(console.error);
