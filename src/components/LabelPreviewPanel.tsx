import { useState, useRef } from "react";
import { Printer, Palette, Download, ArrowLeft, Eye, Sparkles, ChevronLeft, ChevronRight, Tag, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  LABEL_PRESET_CATEGORIES,
  getLabelPresetsByCategory,
  type LabelPreset,
  type LabelCategoryFilter,
} from "@/data/labelPresets";
import { toast } from "sonner";
import StyledQR from "./StyledQR";
import type { LabelConfig } from "./LabelMaker";
import type { StyleConfig } from "./StyledQR";

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
  labelConfig: LabelConfig;
  setLabelConfig: (fn: ((prev: LabelConfig) => LabelConfig)) => void;
  styleConfig: StyleConfig;
  setStyleConfig: (v: StyleConfig) => void;
};

export default function LabelPreviewPanel({
  uploadedData,
  showStyleSettings,
  setShowStyleSettings,
  renderSingleLabel,
  handlePrint,
  labelConfig,
  setLabelConfig,
  styleConfig,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<LabelCategoryFilter>("all");
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const [isHoveringLabel, setIsHoveringLabel] = useState(false);

  const filteredPresets = getLabelPresetsByCategory(selectedCategory);

  const scrollLeft = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  const applyLabelPreset = (preset: LabelPreset) => {
    setLabelConfig((prev: LabelConfig) => ({
      ...prev,
      ...preset.config,
    } as LabelConfig));
    toast.success(`Applied "${preset.name}" style`);
  };

  // Get dynamic layout class based on AI decision
  const getLayoutClass = () => {
    const layout = labelConfig.layout;
    switch (layout) {
      case 'horizontal':
        return 'flex-row';
      case 'vertical':
        return 'flex-col';
      case 'qr-only':
        return 'flex-col items-center';
      case 'address':
      case '2x4-label':
        return 'flex-row';
      case 'product-tag':
        return 'flex-col items-center';
      default:
        return 'flex-row';
    }
  };

  // Get AI-derived info for display
  const aiInfo = labelConfig.aiNote ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20"
    >
      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
        AI Optimized
      </span>
    </motion.div>
  ) : null;

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
                <CardTitle className="text-2xl font-bold">Label Preview</CardTitle>
                <CardDescription className="text-base">
                  Preview and customize your label design
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {aiInfo}
            </div>
          </div>
        </CardHeader>

        {/* Scrollable Content */}
        <CardContent className="flex-1 overflow-y-auto space-y-6 pt-6">
          <div className="flex flex-col items-center gap-6 min-h-full">
            {/* PREVIEW BOX */}
            <div className="w-full max-w-sm shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Preview (First Label)</span>
                {uploadedData.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {uploadedData.length} total
                  </Badge>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                style={{ perspective: 1000 }}
                className="relative"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl -z-10" />

                {/* 3D Container */}
                <motion.div
                  animate={{
                    rotateY: isHoveringLabel ? 5 : 0,
                    rotateX: isHoveringLabel ? 5 : 0,
                    scale: isHoveringLabel ? 1.02 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  onMouseEnter={() => setIsHoveringLabel(true)}
                  onMouseLeave={() => setIsHoveringLabel(false)}
                  className="preview-area w-full aspect-[3/2] flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/10 rounded-xl border border-border/50 shadow-xl relative overflow-hidden"
                >
                  {/* AI Layout Indicator */}
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

                  {/* Label Preview */}
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`
                      relative bg-white rounded-lg shadow-md p-3 transform transition-all
                      flex ${getLayoutClass()}
                      items-center justify-center
                    `}
                    style={{
                      padding: `${labelConfig.padding || 12}px`,
                      gap: `${labelConfig.gap || 8}px`,
                    }}
                  >
                    {renderSingleLabel(uploadedData[0])}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Label Info */}
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
                {labelConfig.baseFontSize && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{labelConfig.baseFontSize}px</span>
                    </div>
                  </>
                )}
                {labelConfig.qrSize && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium">QR: {labelConfig.qrSize}px</span>
                    </div>
                  </>
                )}
                {labelConfig.leftWidthPercent && labelConfig.rightWidthPercent && labelConfig.layout === 'horizontal' && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-purple-500">
                        {labelConfig.leftWidthPercent}/{labelConfig.rightWidthPercent}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Label Presets */}
            <div className="w-full max-w-sm shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-base">Quick Label Styles</h4>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {filteredPresets.length} styles
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide max-w-full">
                {LABEL_PRESET_CATEGORIES.slice(0, 6).map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.id
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                        : "bg-white text-muted-foreground hover:bg-white/80 border border-border"
                      }`}
                  >
                    {cat.icon} {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Presets Scroll */}
              <div className="relative w-full overflow-hidden">
                {filteredPresets.length > 4 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </>
                )}

                <div
                  ref={setScrollContainer}
                  className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-8 snap-x"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {filteredPresets.slice(0, 10).map((preset) => (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-20 cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 snap-start ${labelConfig.borderWidth === preset.config.borderWidth &&
                          labelConfig.borderColor === preset.config.borderColor &&
                          labelConfig.layout === preset.config.layout
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => applyLabelPreset(preset)}
                    >
                      {/* Mini Preview */}
                      <div
                        className="aspect-square p-1.5 flex items-center justify-center"
                        style={{
                          background: preset.previewColors.background,
                        }}
                      >
                        <div
                          className="w-10 h-8 rounded border flex items-center justify-center overflow-hidden"
                          style={{
                            borderColor: preset.previewColors.border,
                            borderWidth: preset.config.borderWidth,
                          }}
                        >
                          <div className="scale-35">
                            <StyledQR
                              value="https://example.com"
                              size={28}
                              styleConfig={styleConfig}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-1 bg-card border-t border-border">
                        <p className="text-[9px] font-medium truncate text-center">
                          {preset.name}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white border-2 border-border hover:border-primary/50 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl font-semibold"
                >
                  <Printer className="w-5 h-5" />
                  Print Labels
                  {uploadedData.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5 text-xs bg-white/20 text-white hover:bg-white/30"
                    >
                      {uploadedData.length}
                    </Badge>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

