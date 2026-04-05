import { useState } from "react";
import { Printer, Download, Eye, Sparkles, ChevronLeft, ChevronRight, Tag, Layers, LayoutGrid } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type { LabelConfig } from "./LabelMaker";
import type { StyleConfig } from "./StyledQR";
import type { PrintConfig } from "./PrintSettings";

type Props = {
  uploadedData: Record<string, string>[];
  printRef: React.RefObject<HTMLDivElement>;
  showStyleSettings: boolean;
  setShowStyleSettings: (v: boolean) => void;
  renderSingleLabel: (
    row?: Record<string, string>,
    index?: number
  ) => React.ReactNode;
  handlePrint: () => void;
  handleDownloadPdf?: () => void;
  labelConfig: LabelConfig;
  setLabelConfig: (fn: ((prev: LabelConfig) => LabelConfig)) => void;
  styleConfig: StyleConfig;
  setStyleConfig: (v: StyleConfig) => void;
  printConfig: PrintConfig;
  generationMode: "single" | "batch";
  forceSinglePreview?: boolean;
};

// Paper dimensions in mm
const PAPER_DIMS: Record<string, { w: number; h: number }> = {
  a3: { w: 297, h: 420 },
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
  letter: { w: 215.9, h: 279.4 },
  legal: { w: 215.9, h: 355.6 },
  executive: { w: 184.1, h: 266.7 },
  custom: { w: 210, h: 297 },
};

const PX_PER_MM = 3.78; // 96 DPI standard

export default function LabelPreviewPanel({
  uploadedData,
  renderSingleLabel,
  handlePrint,
  handleDownloadPdf,
  labelConfig,
  printConfig,
  generationMode,
  forceSinglePreview = false,
}: Props) {
  const [isHoveringLabel, setIsHoveringLabel] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);

  /* ============================================================
     Print Preview Calculations (batch only)
  ============================================================ */
  const paper = PAPER_DIMS[printConfig.paperSize] || PAPER_DIMS.a4;
  const usableH = paper.h - printConfig.marginTop * 2;

  const labelsPerRow = printConfig.labelsPerRow;
  const labelW = printConfig.labelWidth;
  const labelH = printConfig.labelHeight;
  const gapH = printConfig.gapHorizontal;
  const gapV = printConfig.gapVertical;

  const labelsPerCol = Math.max(1, Math.floor((usableH + gapV) / (labelH + gapV)));
  const labelsPerPage = labelsPerRow * labelsPerCol;
  const totalLabels = Math.max(uploadedData.length, 1);
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  const PREVIEW_W = 260;
  const scale = PREVIEW_W / paper.w;
  const previewH = paper.h * scale;

  const scaledMarginTop = printConfig.marginTop * scale;
  const scaledMarginLeft = printConfig.marginLeft * scale;
  const scaledLabelW = labelW * scale;
  const scaledLabelH = labelH * scale;
  const scaledGapH = gapH * scale;
  const scaledGapV = gapV * scale;

  const pageStart = previewPage * labelsPerPage;
  const pageLabels = Array.from({ length: labelsPerPage }, (_, i) => {
    const globalIdx = pageStart + i;
    if (uploadedData.length > 0) {
      return uploadedData[globalIdx] !== undefined ? uploadedData[globalIdx] : null;
    }
    return globalIdx === 0 ? undefined : null;
  });

  /* ============================================================
     AI badge
  ============================================================ */
  const aiInfo = labelConfig.aiNote ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20"
    >
      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Optimized</span>
    </motion.div>
  ) : null;

  /* ============================================================
     Action Buttons (shared)
  ============================================================ */
  const ActionButtons = ({ count }: { count?: number }) => (
    <div className="grid grid-cols-2 gap-3 w-full">
      <motion.button
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownloadPdf ?? handlePrint}
        className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white border-2 border-border hover:border-primary/50 transition-colors font-semibold text-sm"
      >
        <Download className="w-4 h-4" />
        Export PDF
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePrint}
        className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl font-semibold text-sm"
      >
        <Printer className="w-4 h-4" />
        {generationMode === "batch" ? "Print All" : "Print Label"}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-white/20 text-white hover:bg-white/30">
            {count}
          </Badge>
        )}
      </motion.button>
    </div>
  );

  /* ============================================================
     Render
  ============================================================ */
  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col border-0 shadow-xl bg-gradient-to-br from-white to-secondary/20 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
              >
                <Tag className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {generationMode === "batch" ? "Print Preview" : "Label Preview"}
                </CardTitle>
                <CardDescription className="text-base">
                  {generationMode === "batch"
                    ? "See how labels will be laid out on paper"
                    : "Preview and customize your label design"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">{aiInfo}</div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto pt-6">

          {/* ===== SINGLE MODE OR FORCE SINGLE: Label Preview ===== */}
          {(generationMode === "single" || forceSinglePreview) && (
            <div className="flex flex-col items-center gap-6">
              {/* Preview box */}
              <div className="w-full max-w-sm shrink-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Live Preview</span>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  style={{ perspective: 1000 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl -z-10" />

                  <motion.div
                    animate={{
                      rotateY: isHoveringLabel ? 5 : 0,
                      rotateX: isHoveringLabel ? 5 : 0,
                      scale: isHoveringLabel ? 1.02 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    onMouseEnter={() => setIsHoveringLabel(true)}
                    onMouseLeave={() => setIsHoveringLabel(false)}
                    className="w-full aspect-[3/2] flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/10 rounded-xl border border-border/50 shadow-xl relative overflow-hidden"
                  >
                    {labelConfig.aiNote && (
                      <div className="absolute top-2 right-2 z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1 shadow-lg"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI
                        </motion.div>
                      </div>
                    )}
                    <div className="flex items-center justify-center overflow-hidden">
                      {renderSingleLabel(undefined)}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Label meta info */}
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span className="capitalize">{labelConfig.layout}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{labelConfig.fields.length} fields</span>
                  </div>
                  {labelConfig.labelWidth && labelConfig.labelHeight && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="font-medium">{labelConfig.labelWidth}×{labelConfig.labelHeight}mm</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full max-w-sm">
                <ActionButtons />
              </div>
            </div>
          )}

          {/* ===== BATCH MODE: Print Preview (sheet layout) ===== */}
          {generationMode === "batch" && !forceSinglePreview && (
            <div className="flex flex-col items-center gap-4">
              {/* Stats row */}
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>
                    {labelsPerRow} × {labelsPerCol} per page
                    <span className="mx-1.5 opacity-40">·</span>
                    {labelsPerPage} labels/page
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {printConfig.paperSize.toUpperCase()} · {paper.w}×{paper.h}mm
                </Badge>
              </div>

              {/* Paper sheet */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${previewPage}-${labelsPerRow}-${labelW}-${labelH}-${printConfig.gapHorizontal}-${printConfig.gapVertical}-${printConfig.marginTop}-${printConfig.marginLeft}-${printConfig.paperSize}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-sm shadow-2xl border border-border/60 bg-white overflow-hidden"
                  style={{ width: PREVIEW_W, height: previewH }}
                >
                  {/* Subtle grid texture */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 8px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 8px)",
                    }}
                  />

                  {/* Margin indicator */}
                  <div
                    className="absolute border border-dashed border-blue-300/60 pointer-events-none"
                    style={{
                      top: scaledMarginTop,
                      left: scaledMarginLeft,
                      width: Math.max(0, PREVIEW_W - scaledMarginLeft * 2),
                      height: Math.max(0, previewH - scaledMarginTop * 2),
                    }}
                  />

                  {/* Label grid */}
                  {Array.from({ length: labelsPerCol }, (_, row) =>
                    Array.from({ length: labelsPerRow }, (_, col) => {
                      const idx = row * labelsPerRow + col;
                      const rowData = pageLabels[idx];
                      const isEmpty = rowData === null;

                      const x = scaledMarginLeft + col * (scaledLabelW + scaledGapH);
                      const y = scaledMarginTop + row * (scaledLabelH + scaledGapV);

                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`absolute overflow-hidden flex items-center justify-center ${isEmpty ? "opacity-10" : ""}`}
                          style={{
                            left: x,
                            top: y,
                            width: scaledLabelW,
                            height: scaledLabelH,
                            border: `${Math.max(0.5, labelConfig.borderWidth * scale)}px solid ${labelConfig.borderColor}`,
                            backgroundColor: labelConfig.qrBgColor || "#ffffff",
                            borderRadius: 2,
                            boxSizing: 'border-box',
                          }}
                        >
                          {!isEmpty && (
                            <div
                              style={{
                                transform: `scale(${scale / PX_PER_MM})`,
                                transformOrigin: "center center",
                                pointerEvents: "none",
                              }}
                            >
                              {renderSingleLabel(rowData === undefined ? undefined : rowData, idx)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Page watermark */}
                  <div className="absolute bottom-1 right-2 text-[8px] text-gray-300 font-medium select-none">
                    {previewPage + 1} / {totalPages}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Page navigator */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={previewPage === 0}
                    onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <span className="text-xs text-muted-foreground font-medium">
                    Page {previewPage + 1} of {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={previewPage >= totalPages - 1}
                    onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}

              {/* Settings summary */}
              <div className="w-full rounded-xl bg-secondary/30 border border-border/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Print Settings Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Label size</span>
                    <span className="font-medium text-foreground">{labelW}×{labelH}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per row</span>
                    <span className="font-medium text-foreground">{labelsPerRow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>H gap</span>
                    <span className="font-medium text-foreground">{gapH}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>V gap</span>
                    <span className="font-medium text-foreground">{gapV}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin T/L</span>
                    <span className="font-medium text-foreground">{printConfig.marginTop}/{printConfig.marginLeft}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total labels</span>
                    <span className="font-medium text-foreground">{uploadedData.length || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <ActionButtons count={uploadedData.length} />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
