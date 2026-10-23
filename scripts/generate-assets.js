const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, getPixel) {
  // RGBA 8-bit
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // Filter byte None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const idx = y * rowSize + 1 + x * 4;
      rawData[idx] = r;
      rawData[idx + 1] = g;
      rawData[idx + 2] = b;
      rawData[idx + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance to rounded rectangle (squircle)
function distRoundedRect(x, y, cx, cy, halfW, halfH, r) {
  const dx = Math.abs(x - cx) - (halfW - r);
  const dy = Math.abs(y - cy) - (halfH - r);
  if (dx <= 0 && dy <= 0) return -1; // strictly inside
  if (dx > 0 && dy > 0) {
    return Math.hypot(dx, dy) - r;
  }
  return Math.max(dx, dy) - r;
}

// Generate the Ola Emblem pixel at (x, y)
// Center at (cx, cy), squircle dimension (boxW, boxH), corner radius (radius)
function getOlaPixel(x, y, cx, cy, boxSize, bgDark = true) {
  const halfSize = boxSize / 2;
  const cornerRadius = boxSize * 0.28;

  const dSquircle = distRoundedRect(x, y, cx, cy, halfSize, halfSize, cornerRadius);

  // If outside squircle
  if (dSquircle > 0.5) {
    return bgDark ? [0, 0, 0, 255] : [0, 0, 0, 0];
  }

  // Inside squircle: check concentric circles
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);

  const r1 = boxSize * 0.32; // white ring outer radius
  const r2 = boxSize * 0.22; // black ring outer radius
  const r3 = boxSize * 0.11; // lime center radius

  // Anti-aliased boundaries
  if (dist <= r3) {
    return [200, 230, 0, 255]; // center lime
  } else if (dist <= r2) {
    return [0, 0, 0, 255]; // black ring
  } else if (dist <= r1) {
    return [255, 255, 255, 255]; // white ring
  } else {
    // Squircle lime base
    return [200, 230, 0, 255];
  }
}

const assetsDir = path.join(__dirname, '..', 'assets');

console.log('Generating assets in:', assetsDir);

// 1. icon.png (1024x1024, full squircle centered on black or standalone squircle)
const iconBuffer = encodePNG(1024, 1024, (x, y, w, h) => {
  // Squircle size 860px centered
  return getOlaPixel(x, y, 512, 512, 860, false);
});
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
console.log('Saved icon.png');

// 2. android-icon-foreground.png (1024x1024, centered emblem with safe margin)
const fgBuffer = encodePNG(1024, 1024, (x, y, w, h) => {
  // Center emblem at size 580 inside 1024 adaptive icon
  return getOlaPixel(x, y, 512, 512, 580, false);
});
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), fgBuffer);
console.log('Saved android-icon-foreground.png');

// 3. android-icon-background.png (1024x1024, solid black)
const bgBuffer = encodePNG(1024, 1024, () => [0, 0, 0, 255]);
fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), bgBuffer);
console.log('Saved android-icon-background.png');

// 4. android-icon-monochrome.png (1024x1024, white emblem)
const monoBuffer = encodePNG(1024, 1024, (x, y) => {
  const halfSize = 290;
  const d = distRoundedRect(x, y, 512, 512, halfSize, halfSize, 580 * 0.28);
  if (d <= 0.5) {
    const dist = Math.hypot(x - 512, y - 512);
    if (dist <= 580 * 0.11) return [255, 255, 255, 255];
    if (dist <= 580 * 0.22) return [0, 0, 0, 255];
    if (dist <= 580 * 0.32) return [255, 255, 255, 255];
    return [255, 255, 255, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, 'android-icon-monochrome.png'), monoBuffer);
console.log('Saved android-icon-monochrome.png');

// 5. splash-icon.png (512x512)
const splashBuffer = encodePNG(512, 512, (x, y) => {
  return getOlaPixel(x, y, 256, 256, 300, false);
});
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splashBuffer);
console.log('Saved splash-icon.png');

// 6. favicon.png (48x48)
const favBuffer = encodePNG(48, 48, (x, y) => {
  return getOlaPixel(x, y, 24, 24, 44, false);
});
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favBuffer);
console.log('Saved favicon.png');

console.log('All icons generated successfully!');
