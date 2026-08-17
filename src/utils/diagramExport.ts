import { ArchType } from '../../types';

export interface DiagramExportOptions {
  archType: ArchType;
  archTitle?: string;
  category?: string;
  format?: 'png' | 'svg' | 'jpeg' | 'webp';
  scale?: 1 | 2 | 3 | 4;
  theme?: 'obsidian' | 'slate' | 'white' | 'transparent';
  includeBanner?: boolean;
  includeWatermark?: boolean;
  filename?: string;
}

const THEME_BACKGROUNDS: Record<string, string> = {
  obsidian: '#09090b',
  slate: '#0f172a',
  white: '#ffffff',
  transparent: 'transparent',
};

/**
 * Normalizes and extracts a clean, standalone SVG source string from an in-DOM SVG element.
 */
export function getCleanSvgString(
  svgElement: SVGSVGElement,
  options: Partial<DiagramExportOptions> = {}
): string {
  const {
    archTitle,
    category,
    theme = 'obsidian',
    includeBanner = false,
    includeWatermark = false,
  } = options;

  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  // Reset interactive transformation matrix
  const mainGroup = clonedSvg.querySelector('g');
  if (mainGroup) {
    mainGroup.setAttribute('transform', 'translate(0, 0) scale(1)');
  }

  // Clear all hover/selection opacity and filters so everything is fully rendered
  const allElements = clonedSvg.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el instanceof SVGElement) {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transition = 'none';
    }
  });

  // Determine dimensions and viewBox
  const baseWidth = 400;
  const baseHeight = 300;
  const bannerHeight = includeBanner ? 42 : 0;
  const watermarkHeight = includeWatermark ? 22 : 0;
  const totalHeight = baseHeight + bannerHeight + watermarkHeight;

  clonedSvg.setAttribute('viewBox', `0 0 ${baseWidth} ${totalHeight}`);
  clonedSvg.setAttribute('width', '100%');
  clonedSvg.setAttribute('height', '100%');
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // If banner is included, shift diagram content down
  if (bannerHeight > 0 && mainGroup) {
    const existingContent = mainGroup.innerHTML;
    mainGroup.innerHTML = `<g transform="translate(0, ${bannerHeight})">${existingContent}</g>`;
  }

  // Insert background rect if not transparent
  const bgColor = THEME_BACKGROUNDS[theme] || '#09090b';
  if (theme !== 'transparent') {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', bgColor);
    bgRect.setAttribute('rx', '8');
    clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
  }

  // Insert embedded typography & styling defs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
    text {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mono-font {
      font-family: 'JetBrains Mono', monospace;
    }
  `;
  defs.appendChild(style);
  clonedSvg.insertBefore(defs, clonedSvg.firstChild);

  // Optional Metadata Banner (Top Header)
  if (includeBanner && archTitle) {
    const bannerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bannerGroup.setAttribute('class', 'metadata-banner');
    
    // Header divider line
    const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    divider.setAttribute('x1', '14');
    divider.setAttribute('y1', '36');
    divider.setAttribute('x2', '386');
    divider.setAttribute('y2', '36');
    divider.setAttribute('stroke', theme === 'white' ? '#e2e8f0' : '#27272a');
    divider.setAttribute('stroke-width', '1');
    bannerGroup.appendChild(divider);

    // Title Text
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', '16');
    titleText.setAttribute('y', '22');
    titleText.setAttribute('fill', theme === 'white' ? '#0f172a' : '#f8fafc');
    titleText.setAttribute('font-size', '13');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('letter-spacing', '-0.02em');
    titleText.textContent = archTitle.toUpperCase();
    bannerGroup.appendChild(titleText);

    // Category / Archetype Pill
    if (category) {
      const catText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      catText.setAttribute('x', '384');
      catText.setAttribute('y', '22');
      catText.setAttribute('text-anchor', 'end');
      catText.setAttribute('fill', theme === 'white' ? '#3b82f6' : '#60a5fa');
      catText.setAttribute('font-size', '9');
      catText.setAttribute('font-weight', '700');
      catText.setAttribute('class', 'mono-font');
      catText.textContent = `[ ${category} ]`;
      bannerGroup.appendChild(catText);
    }

    clonedSvg.appendChild(bannerGroup);
  }

  // Optional Watermark (Bottom Footer)
  if (includeWatermark) {
    const watermarkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    watermarkGroup.setAttribute('class', 'watermark-footer');

    const dateStr = new Date().toISOString().split('T')[0];
    const watermarkText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    watermarkText.setAttribute('x', '200');
    watermarkText.setAttribute('y', String(totalHeight - 8));
    watermarkText.setAttribute('text-anchor', 'middle');
    watermarkText.setAttribute('fill', theme === 'white' ? '#94a3b8' : '#52525b');
    watermarkText.setAttribute('font-size', '7.5');
    watermarkText.setAttribute('class', 'mono-font');
    watermarkText.textContent = `ArchFiddle • Architecture Specification • Exported ${dateStr}`;
    watermarkGroup.appendChild(watermarkText);

    clonedSvg.appendChild(watermarkGroup);
  }

  const serializer = new XMLSerializer();
  let rawXml = serializer.serializeToString(clonedSvg);

  // Ensure root namespace is present
  if (!rawXml.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    rawXml = rawXml.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${rawXml}`;
}

/**
 * Converts a clean SVG string into a High-DPI HTMLCanvasElement.
 */
export function renderSvgToCanvas(
  svgString: string,
  scale: number = 2,
  theme: 'obsidian' | 'slate' | 'white' | 'transparent' = 'obsidian'
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // Extract aspect ratio from viewBox or dimensions
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        const viewBox = svgEl?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 400, 300];
        
        const svgWidth = viewBox[2] || 400;
        const svgHeight = viewBox[3] || 300;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(svgWidth * scale);
        canvas.height = Math.round(svgHeight * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background if not transparent
        if (theme !== 'transparent') {
          ctx.fillStyle = THEME_BACKGROUNDS[theme] || '#09090b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Downloads the current architecture diagram as an SVG vector file.
 */
export function downloadSvgDiagram(
  svgElement: SVGSVGElement,
  options: Partial<DiagramExportOptions> = {}
): void {
  const svgString = getCleanSvgString(svgElement, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const defaultName = options.archType
    ? `${options.archType.replace(/\s+/g, '-').toLowerCase()}-architecture.svg`
    : 'architecture-diagram.svg';
  const filename = options.filename || defaultName;

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the current architecture diagram as a High-Res PNG, JPEG, or WebP raster image.
 */
export async function downloadRasterDiagram(
  svgElement: SVGSVGElement,
  options: Partial<DiagramExportOptions> = {}
): Promise<void> {
  const {
    format = 'png',
    scale = 2,
    theme = 'obsidian',
    archType = 'clean',
  } = options;

  const svgString = getCleanSvgString(svgElement, options);
  const canvas = await renderSvgToCanvas(svgString, scale, theme);

  let mimeType = 'image/png';
  let ext = 'png';
  if (format === 'jpeg') {
    mimeType = 'image/jpeg';
    ext = 'jpg';
  } else if (format === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  }

  const defaultName = `${archType.replace(/\s+/g, '-').toLowerCase()}-architecture.${ext}`;
  const filename = options.filename || defaultName;

  const dataUrl = canvas.toDataURL(mimeType, 0.95);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the high-resolution PNG image directly to the user's system clipboard.
 */
export async function copyDiagramImageToClipboard(
  svgElement: SVGSVGElement,
  options: Partial<DiagramExportOptions> = {}
): Promise<boolean> {
  try {
    const scale = options.scale || 2;
    const theme = options.theme || 'obsidian';
    const svgString = getCleanSvgString(svgElement, options);
    const canvas = await renderSvgToCanvas(svgString, scale, theme);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch (err) {
          console.error('Clipboard copy failed:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Error copying diagram to clipboard:', err);
    return false;
  }
}
