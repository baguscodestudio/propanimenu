import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

function legacyRgba(r, g, b, a) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    if (a < 1) {
        a = Math.max(0, Math.min(1, a));
        return `rgba(${r},${g},${b},${a})`;
    }
    return `rgb(${r},${g},${b})`;
}

function parseCssVars(css) {
    const map = {};
    const varRe = /(?:^|[;{}])\s*--([\w-]+)\s*:\s*(rgb(?:a)?\(\s*\d+\s*[,/ ]\s*\d+\s*[,/ ]\s*\d+\)|#[0-9a-fA-F]{3,8})(?=\s*;)/g;
    let m;
    while ((m = varRe.exec(css)) !== null) {
        const varName = '--' + m[1];
        const value = m[2];
        if (value.startsWith('#')) {
            const hex = value.slice(1);
            if (hex.length <= 4) {
                map[varName] = { r: parseInt(hex[0] + hex[0], 16), g: parseInt(hex[1] + hex[1], 16), b: parseInt(hex[2] + hex[2], 16) };
            } else {
                map[varName] = { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
            }
        } else {
            const rgbMatch = value.match(/\b(\d+)\s*[,/ ]\s*(\d+)\s*[,/ ]\s*(\d+)/);
            if (rgbMatch) {
                map[varName] = { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
            }
        }
    }
    return map;
}

function hexToRgba(hex) {
    hex = hex.replace(/^#/, '');
    let r, g, b, a = 1;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
        a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
        return `#${hex}`;
    }
    return legacyRgba(r, g, b, a);
}

function convertColorMix(code, vars) {
    return code.replace(
        /color-mix\(\s*in\s+oklab\s*,\s*var\(([^)]+)\)\s+(\d*\.?\d+)%\s*,\s*transparent\s*\)/gi,
        (_m, varName, pct) => {
            const val = vars[varName];
            if (val) {
                const alpha = parseFloat(pct) / 100;
                return legacyRgba(val.r, val.g, val.b, alpha);
            }
            return _m;
        },
    );
}

function convertModernRgb(code) {
    return code.replace(
        /rgba?\(\s*(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)(?:\s*\/\s*(\d*\.?\d+%?))?\s*\)/gi,
        (_m, r, g, b, a) => {
            const ra = a ? parseFloat(a) / (a.includes('%') ? 100 : 1) : 1;
            return legacyRgba(parseFloat(r), parseFloat(g), parseFloat(b), ra);
        },
    );
}

function convertModernHsl(code) {
    return code.replace(
        /hsla?\(\s*(\d+\.?\d*)\s+(\d*\.?\d+%?)\s+(\d*\.?\d+%?)(?:\s*\/\s*(\d*\.?\d+%?))?\s*\)/gi,
        (_m, h, s, l, a) => {
            const H = parseFloat(h);
            const S = parseFloat(s) / (s.includes('%') ? 100 : 1);
            const L = parseFloat(l) / (l.includes('%') ? 100 : 1);
            const A = a ? parseFloat(a) / (a.includes('%') ? 100 : 1) : 1;
            const c = (1 - Math.abs(2 * L - 1)) * S;
            const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
            const m2 = L - c / 2;
            let r1 = 0, g1 = 0, b1 = 0;
            if (H < 60) { r1 = c; g1 = x; }
            else if (H < 120) { r1 = x; g1 = c; }
            else if (H < 180) { g1 = c; b1 = x; }
            else if (H < 240) { g1 = x; b1 = c; }
            else if (H < 300) { r1 = x; b1 = c; }
            else { r1 = c; b1 = x; }
            return legacyRgba(
                Math.round((r1 + m2) * 255),
                Math.round((g1 + m2) * 255),
                Math.round((b1 + m2) * 255),
                A,
            );
        },
    );
}

function parseOklch(L, C, H, alpha) {
    const l = parseFloat(L) / (L.includes('%') ? 100 : 1);
    const c = parseFloat(C) / (C.includes('%') ? 100 : 1);
    const a = alpha ? parseFloat(alpha) / (alpha.includes('%') ? 100 : 1) : 1;
    const hRad = (parseFloat(H) * Math.PI) / 180;
    const aVal = c * Math.cos(hRad);
    const bVal = c * Math.sin(hRad);
    const l_ = l + 0.3963377774 * aVal + 0.2158037573 * bVal;
    const m_ = l - 0.1055613458 * aVal - 0.0638541728 * bVal;
    const s_ = l - 0.0894841775 * aVal - 1.291485548 * bVal;
    const ll = l_ * l_ * l_;
    const mm = m_ * m_ * m_;
    const ss = s_ * s_ * s_;
    const linR = 4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
    const linG = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
    const linB = -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss;
    const toSRGB = (v) => {
        v = Math.max(0, Math.min(1, v));
        return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    };
    const r = Math.round(toSRGB(linR) * 255);
    const g = Math.round(toSRGB(linG) * 255);
    const b = Math.round(toSRGB(linB) * 255);
    return legacyRgba(r, g, b, a);
}

function convertOklch(code) {
    return code.replace(
        /oklch\(\s*(\d*\.?\d+%?)\s+(\d*\.?\d+%?)\s+(\d*\.?\d+)\s*(?:\/\s*(\d*\.?\d+%?))?\s*\)/gi,
        (_m, L, C, H, alpha) => parseOklch(L, C, H, alpha),
    );
}

function convertHex(code) {
    return code.replace(/#([0-9a-f]{3,4}|[0-9a-f]{8})\b/gi, (_m, hex) => hexToRgba(hex));
}

function stripSupportsColorMix(code, vars) {
    return code.replace(
        /@supports\s*\(\s*color:\s*color-mix\s*\(\s*in\s+lab\s*,\s*red\s*,\s*red\s*\)\s*\)\s*\{([^{}]+\{[^{}]+\})\s*\}/gi,
        (_match, innerRule) => {
            const converted = convertColorMix(innerRule, vars);
            if (converted !== innerRule) {
                return converted;
            }
            return _match;
        },
    );
}

function modernCssToLegacy(code) {
    const vars = parseCssVars(code);
    let result = stripSupportsColorMix(code, vars);
    result = convertOklch(result);
    result = convertColorMix(result, vars);
    result = convertModernRgb(result);
    result = convertModernHsl(result);
    result = convertHex(result);
    return result;
}

// ─── Main ─────────────────────────────────────────────────────

const assetsDir = resolve(import.meta.dirname, 'dist/assets');
let files;
try {
    files = readdirSync(assetsDir);
} catch {
    console.error('post-process-css: cannot read', assetsDir);
    process.exit(1);
}

for (const file of files) {
    if (!file.endsWith('.css')) continue;
    const fp = resolve(assetsDir, file);
    const css = readFileSync(fp, 'utf8');
    const transformed = modernCssToLegacy(css);
    if (transformed !== css) {
        writeFileSync(fp, transformed, 'utf8');
        console.log('post-process-css: transformed', file, css.length, '->', transformed.length);
    } else {
        console.log('post-process-css: no change for', file);
    }
}
