import * as fabric from 'fabric';

/**
 * SplitTone — luminance-masked color grading filter.
 *
 * Tints the image's shadows and highlights toward independent colors, the
 * core of "teal & orange"-style grades. The blend weight is a squared
 * luminance ramp so midtones stay mostly untouched, scaled by 0.6 to keep
 * even a 100% amount usable.
 *
 * Registered with fabric's classRegistry so instances survive
 * toObject/loadFromJSON round-trips (history, autosave, project files).
 */

type RGB01 = [number, number, number];

interface SplitToneOwnProps {
  shadows: RGB01;
  highlights: RGB01;
  shadowsAmount: number; // 0..1
  highlightsAmount: number; // 0..1
}

const splitToneDefaultValues: SplitToneOwnProps = {
  shadows: [0, 0, 0],
  highlights: [1, 1, 1],
  shadowsAmount: 0,
  highlightsAmount: 0,
};

const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec3 uShadows;
  uniform vec3 uHighlights;
  uniform vec2 uAmounts;
  varying vec2 vTexCoord;
  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float ws = pow(1.0 - lum, 2.0) * uAmounts.x * 0.6;
    float wh = pow(lum, 2.0) * uAmounts.y * 0.6;
    color.rgb = mix(color.rgb, uShadows, ws);
    color.rgb = mix(color.rgb, uHighlights, wh);
    gl_FragColor = color;
  }
`;

export class SplitTone extends fabric.filters.BaseFilter<'SplitTone', SplitToneOwnProps> {
  declare shadows: RGB01;
  declare highlights: RGB01;
  declare shadowsAmount: number;
  declare highlightsAmount: number;

  static type = 'SplitTone';
  // Base class types this as Record<string, unknown>.
  static defaults: Record<string, unknown> = { ...splitToneDefaultValues };
  static uniformLocations = ['uShadows', 'uHighlights', 'uAmounts'];

  getFragmentSource() {
    return fragmentSource;
  }

  applyTo2d({ imageData: { data } }: { imageData: ImageData }) {
    const [sr, sg, sb] = this.shadows;
    const [hr, hg, hb] = this.highlights;
    const sAmt = this.shadowsAmount * 0.6;
    const hAmt = this.highlightsAmount * 0.6;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const ws = (1 - lum) * (1 - lum) * sAmt;
      const wh = lum * lum * hAmt;
      r += (sr - r) * ws;
      g += (sg - g) * ws;
      b += (sb - b) * ws;
      r += (hr - r) * wh;
      g += (hg - g) * wh;
      b += (hb - b) * wh;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = b * 255;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: Record<string, WebGLUniformLocation>
  ) {
    gl.uniform3fv(uniformLocations.uShadows, this.shadows);
    gl.uniform3fv(uniformLocations.uHighlights, this.highlights);
    gl.uniform2fv(uniformLocations.uAmounts, [this.shadowsAmount, this.highlightsAmount]);
  }

  isNeutralState() {
    return this.shadowsAmount === 0 && this.highlightsAmount === 0;
  }
}

fabric.classRegistry.setClass(SplitTone);

/** '#rrggbb' → [r, g, b] in 0..1, for feeding hex colors into the filter. */
export const hexToRgb01 = (hex: string): RGB01 => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
