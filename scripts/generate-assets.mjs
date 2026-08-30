import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const assetsDir = new URL('../assets/', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
mkdirSync(assetsDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const output = Buffer.alloc(data.length + 12);
  output.writeUInt32BE(data.length, 0);
  typeBuffer.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), data.length + 8);
  return output;
}

function makeIcon(size, fileName, transparent = false) {
  const rows = [];
  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x += 1) {
      const nx = x / size;
      const ny = y / size;
      const dx = x - size / 2;
      const dy = y - size / 2;
      const radius = Math.sqrt(dx * dx + dy * dy);
      let r = 17 + Math.round(nx * 20);
      let g = 22 + Math.round(ny * 16);
      let b = 42 + Math.round((1 - nx) * 22);
      let a = transparent && radius > size * 0.43 ? 0 : 255;

      const ring = radius > size * 0.29 && radius < size * 0.36;
      const upperArrow = y > size * 0.29 && y < size * 0.47 && x > size * 0.23 && x < size * 0.72;
      const upperTip = x >= size * 0.68 && x < size * 0.82 && Math.abs(y - size * 0.38) < (x - size * 0.68) * 0.7;
      const lowerArrow = y > size * 0.53 && y < size * 0.71 && x > size * 0.28 && x < size * 0.77;
      const lowerTip = x > size * 0.18 && x <= size * 0.32 && Math.abs(y - size * 0.62) < (size * 0.32 - x) * 0.7;

      if (ring) [r, g, b] = [62, 234, 181];
      if (upperArrow || upperTip) [r, g, b] = [255, 193, 92];
      if (lowerArrow || lowerTip) [r, g, b] = [126, 107, 255];

      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  writeFileSync(new URL(fileName, assetsDir), png);
}

function copyGeneratedIcon(size, fileName) {
  makeIcon(size, fileName);
  copyFileSync(new URL(fileName, assetsDir), new URL(fileName, publicDir));
}

const sampleRate = 22050;
function makeWav(fileName, notes, volume = 0.24) {
  const duration = notes.reduce((sum, note) => sum + note.duration, 0);
  const sampleCount = Math.ceil(duration * sampleRate);
  const pcm = Buffer.alloc(sampleCount * 2);
  let sampleIndex = 0;
  for (const note of notes) {
    const count = Math.floor(note.duration * sampleRate);
    for (let index = 0; index < count; index += 1) {
      const t = index / sampleRate;
      const envelope = Math.min(1, index / 160) * Math.max(0, 1 - index / count);
      const harmonic = Math.sin(2 * Math.PI * note.frequency * t) + 0.22 * Math.sin(4 * Math.PI * note.frequency * t);
      const sample = Math.max(-1, Math.min(1, harmonic * envelope * volume));
      pcm.writeInt16LE(Math.round(sample * 32767), sampleIndex * 2);
      sampleIndex += 1;
    }
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  writeFileSync(new URL(fileName, assetsDir), Buffer.concat([header, pcm]));
}

makeIcon(1024, 'icon.png');
makeIcon(1024, 'adaptive-icon.png', true);
makeIcon(512, 'splash-icon.png', true);
makeIcon(64, 'favicon.png');
copyGeneratedIcon(192, 'icon-192.png');
copyGeneratedIcon(512, 'icon-512.png');

makeWav('tap.wav', [{ frequency: 520, duration: 0.055 }], 0.12);
makeWav('swipe.wav', [{ frequency: 440, duration: 0.04 }, { frequency: 700, duration: 0.08 }], 0.13);
makeWav('correct.wav', [{ frequency: 620, duration: 0.07 }, { frequency: 880, duration: 0.12 }]);
makeWav('incorrect.wav', [{ frequency: 260, duration: 0.1 }, { frequency: 190, duration: 0.14 }], 0.2);
makeWav('rule.wav', [{ frequency: 440, duration: 0.06 }, { frequency: 660, duration: 0.06 }, { frequency: 990, duration: 0.12 }]);
makeWav('streak.wav', [{ frequency: 740, duration: 0.05 }, { frequency: 930, duration: 0.05 }, { frequency: 1175, duration: 0.13 }]);
makeWav('achievement.wav', [{ frequency: 523, duration: 0.09 }, { frequency: 659, duration: 0.09 }, { frequency: 784, duration: 0.09 }, { frequency: 1047, duration: 0.2 }]);

const musicNotes = [];
for (const chord of [[220, 277, 330], [196, 247, 294], [174, 220, 262], [196, 247, 330]]) {
  for (let beat = 0; beat < 4; beat += 1) {
    musicNotes.push({ frequency: chord[beat % chord.length], duration: 0.22 });
  }
}
makeWav('music.wav', musicNotes, 0.055);

console.log('RuleSwitch icons and offline audio assets generated.');
