/**
 * Self-contained QR Code Generator (Model 2, Version 1-5, Byte Mode, ECC Low)
 * Generates standards-compliant QR code SVG Data URLs with zero external dependencies.
 */

const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = val;
    GF256_EXP[i + 255] = val;
    GF256_LOG[val] = i;
    val <<= 1;
    if (val & 256) val ^= 0x11d;
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function polyMul(p1, p2) {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function polyRest(dividend, divisor) {
  const result = new Uint8Array(dividend);
  for (let i = 0; i <= result.length - divisor.length; i++) {
    const factor = result[i];
    if (factor !== 0) {
      for (let j = 0; j < divisor.length; j++) {
        result[i + j] ^= gfMul(divisor[j], factor);
      }
    }
  }
  return result.slice(result.length - divisor.length + 1);
}

function getGeneratorPoly(degree) {
  let g = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    g = polyMul(g, new Uint8Array([1, GF256_EXP[i]]));
  }
  return g;
}

const VERSIONS = [
  null,
  { size: 21, dataBytes: 19, eccBytes: 7, align: [] },
  { size: 25, dataBytes: 34, eccBytes: 10, align: [6, 18] },
  { size: 29, dataBytes: 55, eccBytes: 15, align: [6, 22] },
  { size: 33, dataBytes: 80, eccBytes: 20, align: [6, 26] }
];

function chooseVersion(dataLen) {
  for (let v = 1; v <= 4; v++) {
    const requiredBytes = dataLen + 2;
    if (requiredBytes <= VERSIONS[v].dataBytes) {
      return v;
    }
  }
  return 4;
}

function encodeData(text, version) {
  const vInfo = VERSIONS[version];
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(4, 4);
  pushBits(textBytes.length, 8);
  for (let b of textBytes) {
    pushBits(b, 8);
  }
  const remainingBits = vInfo.dataBytes * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingBits)));
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < vInfo.dataBytes * 8) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataBytes = new Uint8Array(vInfo.dataBytes);
  for (let i = 0; i < vInfo.dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  const genPoly = getGeneratorPoly(vInfo.eccBytes);
  const dividend = new Uint8Array(vInfo.dataBytes + vInfo.eccBytes);
  dividend.set(dataBytes, 0);
  const eccBytes = polyRest(dividend, genPoly);

  const finalCodewords = new Uint8Array(vInfo.dataBytes + vInfo.eccBytes);
  finalCodewords.set(dataBytes, 0);
  finalCodewords.set(eccBytes, vInfo.dataBytes);

  return finalCodewords;
}

function createMatrix(version) {
  const size = VERSIONS[version].size;
  const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));

  function setModule(r, c, val) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val ? 1 : 0;
      reserved[r][c] = 1;
    }
  }

  function addFinder(top, left) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            setModule(row, col, 1);
          } else {
            setModule(row, col, 0);
          }
        }
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  const align = VERSIONS[version].align;
  for (let r of align) {
    for (let c of align) {
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBlack =
            Math.max(Math.abs(dr), Math.abs(dc)) === 2 || (dr === 0 && dc === 0);
          setModule(r + dr, c + dc, isBlack);
        }
      }
    }
  }

  setModule(size - 8, 8, 1);

  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = 1;
    if (!reserved[i][8]) reserved[i][8] = 1;
  }
  for (let i = size - 8; i < size; i++) {
    if (!reserved[8][i]) reserved[8][i] = 1;
    if (!reserved[i][8]) reserved[i][8] = 1;
  }

  return { matrix, reserved, size };
}

const FORMAT_INFO_L_MASK0 = [0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0];

function placeData(matrixData, codewords) {
  const { matrix, reserved, size } = matrixData;
  const bits = [];
  for (let byte of codewords) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let dir = -1;
  let c = size - 1;

  while (c > 0) {
    if (c === 6) c--;
    for (let count = 0; count < size; count++) {
      const r = dir === -1 ? size - 1 - count : count;
      for (let dc = 0; dc < 2; dc++) {
        const col = c - dc;
        if (!reserved[r][col]) {
          const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = (bit ^ (mask ? 1 : 0)) === 1 ? 1 : 0;
        }
      }
    }
    dir = -dir;
    c -= 2;
  }

  for (let i = 0; i < 15; i++) {
    const bit = FORMAT_INFO_L_MASK0[i];
    if (i <= 5) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i <= 8) matrix[8][8] = bit;
    else matrix[14 - i][8] = bit;

    if (i < 7) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }
}

function renderSvg(matrix, size, margin = 4) {
  const total = size + margin * 2;
  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="#111827"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="100%" height="100%" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#ffffff"/>${rects}</svg>`;
}

const QRCode = {
  async toString(text, options = {}) {
    const version = chooseVersion(new TextEncoder().encode(text).length);
    const codewords = encodeData(text, version);
    const matrixData = createMatrix(version);
    placeData(matrixData, codewords);
    return renderSvg(matrixData.matrix, matrixData.size, options.margin !== undefined ? options.margin : 4);
  },

  async toDataURL(text, options = {}) {
    const svg = await QRCode.toString(text, options);
    const base64 = typeof btoa === "function" ? btoa(svg) : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }
};

export default QRCode;

