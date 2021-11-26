const INITAL_COLOR_1 = "hsl(262, 100%, 83%)";
const INITAL_COLOR_2 = "hsl(231, 95%, 77%)";
const ROTATE_DEG = 1;
let currentColor1 = INITAL_COLOR_1;
let currentColor2 = INITAL_COLOR_2;

/**
 * @param {string} hslColor
 * @returns
 * @throws
 */
function hslColorParse(hslColor) {
  const match = hslColor.match(/^hsl\((\d+), (\d+)%, (\d+)%\)/i);
  if (!match) {
    throw new Error(`HSL inválido: ${hslColor}`);
  }
  const [, h, s, l] = match;
  // console.debug(h, s, l);

  return {
    h: +h,
    s: +s,
    l: +l,
  };
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns
 * @throws
 */
function hslColorStringify(h, s, l) {
  const hslColor = `hsl(${h}, ${s}%, ${l}%)`;
  // console.debug(hslColor);
  return hslColor;
}

function rotateColorInDegress(hslColorIn, deg) {
  const { h, s, l } = hslColorParse(hslColorIn);
  const newH = (h + deg) % 360;
  const hslColorOut = hslColorStringify(newH, s, l);
  // console.debug(hslColorIn, "->", hslColorOut);
  return hslColorOut;
}

function gradientAnimation() {
  currentColor1 = rotateColorInDegress(currentColor1, ROTATE_DEG);
  currentColor2 = rotateColorInDegress(currentColor2, ROTATE_DEG);
  // console.debug(currentColor1, currentColor2);
  const root = document.documentElement;
  root.style.setProperty("--body-bg-color-1", currentColor1);
  root.style.setProperty("--body-bg-color-2", currentColor2);
  window.requestAnimationFrame(gradientAnimation);
}

// Inicia o loop
window.requestAnimationFrame(gradientAnimation);
