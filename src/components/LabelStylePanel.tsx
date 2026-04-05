import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  X,
  QrCode,
  Layout,
  Printer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";
import {
  QR_PRESETS,
  PRESET_CATEGORIES,
  getPresetsByCategory,
  type Preset,
  type CategoryFilter,
} from "@/data/presets";
import StyledQR from "./StyledQR";
import { toast } from "sonner";
import QRStylePanel from "./QRStylePanel";
import { PrintSettings } from "./PrintSettings";

type LayoutType =
  | "horizontal"
  | "vertical"
  | "qr-only"
  | "address"
  | "product-tag"
  | "2x4-label";

type Props = {
  show: boolean;
  onClose: () => void;

  activeStyleTab: "qr" | "layout" | "fields" | "print";
  setActiveStyleTab: (v: "qr" | "layout" | "fields" | "print") => void;

  labelConfig: any;
  setLabelConfig: (fn: any) => void;

  availableColumns: string[];

  printConfig: any;
  setPrintConfig: (v: any) => void;

  styleConfig: any;
  setStyleConfig: (v: any) => void;

  layoutPresets: Record<
    LayoutType,
    { name: string; description: string }
  >;

  setAutoPreviewSize: (v: boolean) => void;
  generationMode?: "single" | "batch";
};

export default function LabelStylePanel({
  show,
  onClose,
  activeStyleTab,
  setActiveStyleTab,
  labelConfig,
  setLabelConfig,
  availableColumns,
  printConfig,
  setPrintConfig,
  styleConfig,
  setStyleConfig,
  layoutPresets,
  setAutoPreviewSize,
  generationMode = "single",
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);

  const filteredPresets = getPresetsByCategory(selectedCategory);

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

  const applyPreset = (preset: Preset) => {
    setStyleConfig(preset.config);
    toast.success(`Applied "${preset.name}" style`);
  };

  const QRCard = ({ preset }: { preset: Preset }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isSelected = JSON.stringify(styleConfig) === JSON.stringify(preset.config);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex-shrink-0 w-20 cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
          isSelected
            ? "border-primary ring-2 ring-primary/30"
            : "border-border hover:border-primary/50"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => applyPreset(preset)}
      >
        <div
          className="aspect-square p-1.5 flex items-center justify-center"
          style={{ background: preset.previewColors.background }}
        >
          <div className="scale-60">
            <StyledQR
              value="https://example.com"
              size={48}
              styleConfig={preset.config}
            />
          </div>
        </div>
        <div className="p-1 bg-card border-t border-border">
          <p className="text-[9px] font-medium truncate text-center">{preset.name}</p>
        </div>
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center"
            >
              {isSelected ? (
                <div className="bg-primary p-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
              ) : (
                <div className="bg-white p-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!show) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="glass-card p-4 h-full overflow-y-auto">      <div className="space-y-8 pb-4">
        {/* LAYOUT SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <Layout className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Layout Pattern</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(layoutPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() =>
                  setLabelConfig((prev: any) => ({ ...prev, layout: key }))
                }
                className={`p-2 rounded-lg border-2 text-left transition-all ${
                  labelConfig.layout === key
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-white"
                }`}
              >
                <span className="text-xs font-semibold block text-foreground">{preset.name}</span>
                <span className="text-[10px] text-muted-foreground">{preset.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* STYLE & BORDERS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Style &amp; Borders</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto Size Label</Label>
                <p className="text-[10px] text-muted-foreground italic">Optimize layout automatically</p>
              </div>
              <Switch
                checked={labelConfig.autoSize}
                onCheckedChange={(checked) =>
                  setLabelConfig((prev: any) => ({
                    ...prev,
                    autoSize: checked,
                    ...(checked ? { labelWidth: undefined, labelHeight: undefined } : {}),
                  }))
                }
              />
            </div>

            {/* Manual Dimensions - Single Mode Only */}
            {generationMode === "single" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Width (mm)</Label>
                  <Slider
                    disabled={labelConfig.autoSize}
                    value={[labelConfig.labelWidth || 50]}
                    min={20}
                    max={150}
                    step={1}
                    onValueChange={([v]) =>
                      setLabelConfig((prev: any) => ({ ...prev, labelWidth: v }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Height (mm)</Label>
                  <Slider
                    disabled={labelConfig.autoSize}
                    value={[labelConfig.labelHeight || 30]}
                    min={15}
                    max={100}
                    step={1}
                    onValueChange={([v]) =>
                      setLabelConfig((prev: any) => ({ ...prev, labelHeight: v }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Style Controls - Always Visible */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border Width</Label>
                <Slider
                  value={[labelConfig.borderWidth]}
                  min={0}
                  max={6}
                  step={1}
                  onValueChange={([v]) =>
                    setLabelConfig((prev: any) => ({ ...prev, borderWidth: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">QR Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer transition-transform hover:scale-110"
                    value={labelConfig.qrColor}
                    onChange={(e) => {
                      setLabelConfig((prev: any) => ({ ...prev, qrColor: e.target.value }))
                    }}
                  />
                  <span className="text-[10px] font-mono uppercase">{labelConfig.qrColor}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR CONFIG SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <QrCode className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">QR Code Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Mode</Label>
                <Select
                  value={labelConfig.qrMode}
                  onValueChange={(v) =>
                    setLabelConfig((prev: any) => ({ ...prev, qrMode: v }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static (Same URL)</SelectItem>
                    <SelectItem value="dynamic">Dynamic (From Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">QR Size</Label>
                <Slider
                  value={[labelConfig.qrSize]}
                  min={30}
                  max={120}
                  step={5}
                  disabled={labelConfig.autoSize}
                  onValueChange={([v]) =>
                    setLabelConfig((prev: any) => ({ ...prev, qrSize: v }))
                  }
                />
              </div>
            </div>

            {labelConfig.qrMode === "static" ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Static Link/Text</Label>
                <Input
                  className="h-8 text-xs"
                  value={labelConfig.staticQrValue}
                  onChange={(e) =>
                    setLabelConfig((prev: any) => ({ ...prev, staticQrValue: e.target.value }))
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dynamic Fields to Encode</Label>
                <Select
                  value={labelConfig.dynamicQrFields.join(",")}
                  onValueChange={(value) =>
                    setLabelConfig((prev: any) => ({
                      ...prev,
                      dynamicQrFields: value ? value.split(",") : [],
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Quick QR Styles Grid */}
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground mb-2 block">Quick QR Styles</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                {filteredPresets.slice(0, 10).map((preset) => (
                  <QRCard key={preset.id} preset={preset} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
