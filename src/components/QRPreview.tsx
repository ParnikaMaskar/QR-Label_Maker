import { useState } from "react";
import StyledQR from "./StyledQR";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, Check, Palette, Sparkles, ChevronLeft, ChevronRight, Scan, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QR_PRESETS,
  PRESET_CATEGORIES,
  getPresetsByCategory,
  type Preset,
  type CategoryFilter,
} from "@/data/presets";
import { toast } from "sonner";

// Type for QR Style Configuration
interface QRStyleConfig {
  dots: {
    type: string;
    color: string;
    gradientEnabled: boolean;
    gradientType: "linear" | "radial";
    gradientColor1: string;
    gradientColor2: string;
  };
  cornersSquare: {
    type: string;
    color: string;
    gradientEnabled: boolean;
    gradientType: "linear" | "radial";
    gradientColor1: string;
    gradientColor2: string;
  };
  cornersDot: {
    type: string;
    color: string;
    gradientEnabled: boolean;
    gradientType: "linear" | "radial";
    gradientColor1: string;
    gradientColor2: string;
  };
  background: {
    color: string;
    gradientEnabled: boolean;
    gradientType: "linear" | "radial";
    gradientColor1: string;
    gradientColor2: string;
  };
  logo: {
    src: string;
    size: number;
    margin: number;
    hideBackgroundDots: boolean;
  };
}

type Props = {
  hasValue: boolean;
  qrValue: string;
  uploadedData: Record<string, string>[];
  selectedColumn: string;
  copied: boolean;
  downloadQR: () => void;
  copyToClipboard: () => void;
  styleConfig: QRStyleConfig;
  uiMode: "simple" | "style";
  setUiMode: (mode: "simple" | "style") => void;
  setStyleConfig: (config: QRStyleConfig) => void;
};

export default function QRPreview({
  hasValue,
  qrValue,
  uploadedData,
  selectedColumn,
  copied,
  downloadQR,
  copyToClipboard,
  styleConfig,
  uiMode,
  setUiMode,
  setStyleConfig,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);

  const filteredPresets = getPresetsByCategory(selectedCategory);

  const applyPreset = (preset: Preset) => {
    setStyleConfig(preset.config);
    toast.success(`Applied "${preset.name}" style`);
  };

  const scrollLeft = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const PresetThumbnail = ({ preset }: { preset: Preset }) => {
    const isSelected = JSON.stringify(styleConfig) === JSON.stringify(preset.config);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex-shrink-0 w-24 cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
          isSelected
            ? "border-2 border-primary ring-2 ring-primary/30"
            : "border-2 border-border hover:border-primary/50"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => applyPreset(preset)}
      >
        {/* Preview Area */}
        <div
          className="aspect-square p-2 flex items-center justify-center relative"
          style={{
            background: preset.previewColors.background,
          }}
        >
          {/* Mini QR Preview */}
          <div className="transform scale-75">
            <StyledQR
              value="https://example.com"
              size={64}
              styleConfig={preset.config}
            />
          </div>

          {/* Hover/Selected Overlay */}
          <AnimatePresence>
            {(isHovered || isSelected) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 flex items-center justify-center"
              >
                {isSelected ? (
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="bg-white text-foreground p-1.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preset Name */}
        <div className="p-1.5 bg-card border-t border-border">
          <p className="text-[10px] font-medium truncate text-center">{preset.name}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Header - Glass Card */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Preview</h3>
              <p className="text-sm text-muted-foreground">
                Scan to test your QR code
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUiMode(uiMode === "simple" ? "style" : "simple")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <Palette className="w-4 h-4" />
            {uiMode === "simple" ? "Customize" : "Edit"}
          </motion.button>
        </div>
      </div>

      {/* QR Preview Card - Premium */}
      <div className="card-premium overflow-hidden rounded-2xl">
        {/* Glow Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="relative p-8">
          <AnimatePresence mode="wait">
            {hasValue || (uploadedData.length > 0 && selectedColumn) ? (
              <motion.div
                key={qrValue}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="flex flex-col items-center"
              >
                {/* QR Code Display - Glowing */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-white p-6 rounded-2xl shadow-xl border border-border/50"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl -z-10" />
                  
                  <div className="qr-preview-container rounded-xl relative">
                    <StyledQR
                      value={
                        uploadedData.length > 0 && selectedColumn
                          ? uploadedData[0][selectedColumn] || "https://example.com"
                          : qrValue
                      }
                      size={240}
                      styleConfig={styleConfig}
                      onReady={(instance: unknown) => {
                        if (instance) {
                          (window as { __qrInstance?: unknown }).__qrInstance = instance;
                        }
                      }}
                    />
                  </div>

                  {/* Hover Overlay */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center"
                      >
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          Hover to zoom
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Action Buttons */}
                {uploadedData.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-3 mt-8 w-full max-w-xs"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadQR}
                      className="flex-1 btn-glow flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyToClipboard}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-success" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-40 h-40 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-secondary/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative z-10">
                    <Scan className="w-7 h-7 text-primary/50" />
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-sm text-muted-foreground max-w-xs"
                >
                  Enter your data on the left to see the QR code preview
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Batch Preview */}
        {uploadedData.length > 0 && selectedColumn && (
          <div className="border-t border-border/50 p-5 bg-secondary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm">
                  Batch Preview ({Math.min(uploadedData.length, 8)} of {uploadedData.length})
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Download ZIP to get all QR codes
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {uploadedData.slice(0, 8).map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white rounded-xl border border-border/50 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <StyledQR
                      value={row[selectedColumn] || "empty"}
                      size={56}
                      styleConfig={styleConfig}
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 + 0.2 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-[10px] flex items-center justify-center text-white font-bold shadow-lg"
                    >
                      {idx + 1}
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2 truncate max-w-full px-1">
                    {row[selectedColumn]?.substring(0, 10) || "—"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Presets Section */}
      <div className="card-premium overflow-hidden rounded-2xl">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-base">Quick Presets</h4>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {filteredPresets.length} styles
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-3 border-b border-border/50 bg-secondary/30">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {PRESET_CATEGORIES.slice(0, 6).map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "bg-white text-muted-foreground hover:bg-white/80 border border-border"
                }`}
              >
                {cat.icon} {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Presets Scrollable List */}
        <div className="relative">
          {/* Scroll Buttons */}
          {filteredPresets.length > 5 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {/* Presets Horizontal Scroll */}
          <div
            ref={setScrollContainer}
            className="flex gap-3 p-4 overflow-x-auto scrollbar-hide max-h-[200px]"
            style={{ scrollBehavior: "smooth" }}
          >
            <AnimatePresence mode="popLayout">
              {filteredPresets.slice(0, 12).map((preset) => (
                <PresetThumbnail key={preset.id} preset={preset} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* View All Link */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-3 border-t border-border/50 bg-gradient-to-r from-primary/5 to-accent/5"
        >
          <button
            onClick={() => setUiMode("style")}
            className="w-full text-center text-sm text-primary hover:text-primary/80 font-semibold flex items-center justify-center gap-1"
          >
            Open Style Panel for more options
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Tips - Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-4"
      >
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Tips
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Test the QR code with your phone camera before downloading
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Use a shorter URL for better scanning reliability
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            High contrast colors work best
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

