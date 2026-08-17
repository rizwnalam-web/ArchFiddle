import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  FileImage,
  FileCode,
  Copy,
  Check,
  Sparkles,
  Layers,
  Settings2,
  X,
  Eye,
  Sliders,
  Sun,
  Moon,
  Maximize2,
  FileText,
  CheckCircle,
  Share2,
  Printer,
  Info,
  Code
} from 'lucide-react';
import { ArchType } from '../types';
import {
  getCleanSvgString,
  downloadSvgDiagram,
  downloadRasterDiagram,
  copyDiagramImageToClipboard,
  DiagramExportOptions,
} from '../src/utils/diagramExport';

interface DiagramExportModalProps {
  svgElement: SVGSVGElement | null;
  archType: ArchType;
  archTitle: string;
  category?: string;
  onClose: () => void;
}

export const DiagramExportModal: React.FC<DiagramExportModalProps> = ({
  svgElement,
  archType,
  archTitle,
  category,
  onClose,
}) => {
  const [format, setFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp'>('png');
  const [scale, setScale] = useState<1 | 2 | 3 | 4>(2);
  const [theme, setTheme] = useState<'obsidian' | 'slate' | 'white' | 'transparent'>('obsidian');
  const [includeBanner, setIncludeBanner] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [filename, setFilename] = useState(
    `${archType.replace(/\s+/g, '-').toLowerCase()}-architecture`
  );

  const [previewSvgString, setPreviewSvgString] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'embed'>('preview');

  // Update preview when options change
  useEffect(() => {
    if (!svgElement) return;

    try {
      const cleanSvg = getCleanSvgString(svgElement, {
        archType,
        archTitle,
        category,
        theme,
        includeBanner,
        includeWatermark,
      });
      setPreviewSvgString(cleanSvg);
    } catch (err) {
      console.error('Failed to generate preview SVG', err);
    }
  }, [svgElement, archType, archTitle, category, theme, includeBanner, includeWatermark]);

  const handleDownload = async () => {
    if (!svgElement) return;
    setIsExporting(true);

    try {
      const finalFilename = `${filename.trim() || 'architecture-diagram'}.${format === 'jpeg' ? 'jpg' : format}`;
      
      const exportOptions: Partial<DiagramExportOptions> = {
        archType,
        archTitle,
        category,
        format,
        scale,
        theme,
        includeBanner,
        includeWatermark,
        filename: finalFilename,
      };

      if (format === 'svg') {
        downloadSvgDiagram(svgElement, exportOptions);
      } else {
        await downloadRasterDiagram(svgElement, exportOptions);
      }

      setCopiedStatus('downloaded');
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!svgElement) return;

    if (format === 'svg') {
      try {
        await navigator.clipboard.writeText(previewSvgString);
        setCopiedStatus('copied-code');
        setTimeout(() => setCopiedStatus(null), 2500);
      } catch (err) {
        console.error('Failed to copy SVG code', err);
      }
    } else {
      setIsExporting(true);
      const success = await copyDiagramImageToClipboard(svgElement, {
        archType,
        archTitle,
        category,
        scale,
        theme,
        includeBanner,
        includeWatermark,
      });
      setIsExporting(false);

      if (success) {
        setCopiedStatus('copied-image');
        setTimeout(() => setCopiedStatus(null), 2500);
      }
    }
  };

  // Dimensions computation
  const baseW = 400;
  const baseH = 300 + (includeBanner ? 42 : 0) + (includeWatermark ? 22 : 0);
  const currentPixelWidth = baseW * (format === 'svg' ? 1 : scale);
  const currentPixelHeight = baseH * (format === 'svg' ? 1 : scale);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-950/60">
              <Download className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Export Architecture Diagram
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[10px] font-mono">
                  {format.toUpperCase()} Vector & Image Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                High-quality visual exports for Confluence, Notion, GitHub READMEs, whitepapers & slide decks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Left Column: Configuration Controls (5 Cols) */}
          <div className="lg:col-span-5 p-5 space-y-6 overflow-y-auto max-h-full">
            {/* Format Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Format</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'png', label: 'PNG', badge: 'High-Res', icon: FileImage },
                  { id: 'svg', label: 'SVG', badge: 'Vector', icon: FileCode },
                  { id: 'jpeg', label: 'JPEG', badge: 'Photo', icon: FileImage },
                  { id: 'webp', label: 'WebP', badge: 'Modern', icon: FileImage },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      format === item.id
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950/50'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{item.label}</span>
                      <item.icon className="w-3.5 h-3.5 opacity-60" />
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 mt-1">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution / DPI Scaling (for Raster PNG / JPEG / WEBP) */}
            {format !== 'svg' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Resolution & Density</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {currentPixelWidth} × {currentPixelHeight} px
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1, label: '1x Web', desc: '1200×900' },
                    { val: 2, label: '2x Retina', desc: '2400×1800 (Rec.)' },
                    { val: 4, label: '4x Ultra-HD', desc: '4800×3600 (300 DPI)' },
                  ].map((res) => (
                    <button
                      key={res.val}
                      onClick={() => setScale(res.val as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        scale === res.val
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{res.label}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {res.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background & Palette */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Background Canvas Style</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'obsidian',
                    label: 'Obsidian Dark',
                    bg: 'bg-zinc-950 border-zinc-700',
                    dot: '#09090b',
                    desc: 'Default Dark Mode',
                  },
                  {
                    id: 'slate',
                    label: 'Slate Tech',
                    bg: 'bg-slate-900 border-slate-700',
                    dot: '#0f172a',
                    desc: 'Navy Blueprint',
                  },
                  {
                    id: 'white',
                    label: 'Pure White (Print)',
                    bg: 'bg-white border-zinc-300 text-zinc-900',
                    dot: '#ffffff',
                    desc: 'Paper & Docs PDF',
                  },
                  {
                    id: 'transparent',
                    label: 'Transparent',
                    bg: 'bg-transparent border-dashed border-zinc-700',
                    dot: 'transparent',
                    desc: 'Slides & Decks',
                  },
                ].map((bgItem) => (
                  <button
                    key={bgItem.id}
                    onClick={() => setTheme(bgItem.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      theme === bgItem.id
                        ? 'bg-zinc-800 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border border-zinc-600 mt-0.5 shrink-0 shadow-sm ${
                        bgItem.id === 'white'
                          ? 'bg-white'
                          : bgItem.id === 'transparent'
                          ? 'bg-zinc-700'
                          : bgItem.id === 'slate'
                          ? 'bg-slate-900'
                          : 'bg-zinc-950'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">{bgItem.label}</div>
                      <div className="text-[10px] text-zinc-500">{bgItem.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Framing & Watermark Toggles */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Documentation Header & Metadata</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 cursor-pointer hover:bg-zinc-900 transition-colors">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    Architecture Title Banner
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Includes top heading: {archTitle.toUpperCase()} [{category}]
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-zinc-800 border-zinc-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 cursor-pointer hover:bg-zinc-900 transition-colors">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    ArchFiddle Watermark & Date
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Timestamp and specification tag in footer
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-zinc-800 border-zinc-700 cursor-pointer"
                />
              </label>
            </div>

            {/* Custom Filename */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300">File Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="architecture-diagram"
                />
                <span className="text-xs font-mono text-zinc-500">
                  .{format === 'jpeg' ? 'jpg' : format}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview & Action Dock (7 Cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-4 bg-zinc-950/60">
            {/* Tab Selector */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'code'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>SVG Markup</span>
                </button>
                <button
                  onClick={() => setActiveTab('embed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'embed'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Markdown & Embed</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-500">
                Output: <span className="text-zinc-300 font-bold">{format.toUpperCase()}</span> •{' '}
                <span className="text-zinc-300 font-bold">{currentPixelWidth}×{currentPixelHeight}</span>
              </div>
            </div>

            {/* Tab 1: Live Preview Canvas */}
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative overflow-hidden min-h-[300px]">
                {theme === 'transparent' && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, #71717a 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                )}

                <div
                  className={`w-full max-w-lg rounded-xl overflow-hidden shadow-2xl transition-all border ${
                    theme === 'white'
                      ? 'bg-white border-zinc-300 text-zinc-900'
                      : theme === 'slate'
                      ? 'bg-slate-900 border-slate-700'
                      : theme === 'transparent'
                      ? 'bg-transparent border-zinc-700'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  {previewSvgString ? (
                    <div
                      className="w-full h-auto"
                      dangerouslySetInnerHTML={{
                        __html: previewSvgString.replace(
                          /<\?xml[^>]*\?>/,
                          ''
                        ),
                      }}
                    />
                  ) : (
                    <div className="p-12 text-center text-zinc-500 text-xs">
                      Loading diagram preview...
                    </div>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>
                    Scalable vector nodes with embedded typography & high-contrast stroke normalization.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: SVG Markup Viewer */}
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden min-h-[300px]">
                <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    SVG XML Source ({previewSvgString.length.toLocaleString()} bytes)
                  </span>
                  <button
                    onClick={handleCopyClipboard}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedStatus === 'copied-code' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={previewSvgString}
                  className="flex-1 w-full p-4 bg-transparent text-zinc-300 font-mono text-[11px] resize-none focus:outline-none selection:bg-blue-600/30"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Tab 3: Markdown & Embed Documentation Helpers */}
            {activeTab === 'embed' && (
              <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4 overflow-y-auto min-h-[300px]">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>GitHub README / Markdown Embed</span>
                  </label>
                  <div className="relative">
                    <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-xs overflow-x-auto">
                      {`![${archTitle} Architecture](./${filename}.${format === 'jpeg' ? 'jpg' : format})`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `![${archTitle} Architecture](./${filename}.${format === 'jpeg' ? 'jpg' : format})`
                        );
                        setCopiedStatus('copied-md');
                        setTimeout(() => setCopiedStatus(null), 2000);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                      title="Copy Markdown snippet"
                    >
                      {copiedStatus === 'copied-md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>HTML Documentation Embed</span>
                  </label>
                  <div className="relative">
                    <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-xs overflow-x-auto">
                      {`<figure>\n  <img src="./${filename}.${format === 'jpeg' ? 'jpg' : format}" alt="${archTitle} Architecture Diagram" width="${currentPixelWidth}" />\n  <figcaption>${archTitle} Architecture Specification</figcaption>\n</figure>`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `<figure>\n  <img src="./${filename}.${format === 'jpeg' ? 'jpg' : format}" alt="${archTitle} Architecture Diagram" width="${currentPixelWidth}" />\n  <figcaption>${archTitle} Architecture Specification</figcaption>\n</figure>`
                        );
                        setCopiedStatus('copied-html');
                        setTimeout(() => setCopiedStatus(null), 2000);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                      title="Copy HTML snippet"
                    >
                      {copiedStatus === 'copied-html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-zinc-300 space-y-1">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Notion & Confluence Integration</span>
                  </div>
                  <p className="text-zinc-400">
                    You can directly drag & drop the downloaded PNG or copy image to clipboard and paste with <kbd className="px-1 py-0.5 bg-zinc-800 rounded font-mono text-zinc-200">Ctrl+V / Cmd+V</kbd> into Notion pages, Jira tickets, or Confluence docs.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyClipboard}
                  disabled={isExporting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {copiedStatus === 'copied-image' || copiedStatus === 'copied-code' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">
                        {format === 'svg' ? 'SVG Code Copied!' : 'Image Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>{format === 'svg' ? 'Copy SVG Code' : 'Copy Image to Clipboard'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-950/60 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating {format.toUpperCase()}...</span>
                    </>
                  ) : copiedStatus === 'downloaded' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Downloaded Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download {format.toUpperCase()} File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
