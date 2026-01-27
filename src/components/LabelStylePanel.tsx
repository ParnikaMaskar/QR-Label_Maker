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

  setAutoPreviewSize: (v: boolean) => void;   // ✅ important
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
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-1/3 flex flex-col gap-4"
    >
      <div className="glass-card p-4 h-full overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Style & QR Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* TABS */}
        <div className="flex border-b mb-4">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none border-b-2 ${
              activeStyleTab === "qr"
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setActiveStyleTab("qr")}
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>

          <Button
            variant="ghost"
            className={`flex-1 rounded-none border-b-2 ${
              activeStyleTab === "layout"
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setActiveStyleTab("layout")}
          >
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </Button>

          <Button
            variant="ghost"
            className={`flex-1 rounded-none border-b-2 ${
              activeStyleTab === "fields"
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setActiveStyleTab("fields")}
          >
            <Palette className="w-4 h-4 mr-2" />
            Styling
          </Button>

          <Button
            variant="ghost"
            className={`flex-1 rounded-none border-b-2 ${
              activeStyleTab === "print"
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setActiveStyleTab("print")}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>

        {/* QR TAB */}
        {activeStyleTab === "qr" && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>QR Mode</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Static</span>
                  <Switch
                    checked={labelConfig.qrMode === "dynamic"}
                    onCheckedChange={(checked) =>
                      setLabelConfig((prev: any) => ({
                        ...prev,
                        qrMode: checked ? "dynamic" : "static",
                      }))
                    }
                  />
                  <span className="text-sm">Dynamic</span>
                </div>
              </div>

              {labelConfig.qrMode === "static" ? (
                <div className="space-y-2">
                  <Label>Static QR Content</Label>
                  <Input
                    value={labelConfig.staticQrValue}
                    onChange={(e) =>
                      setLabelConfig((prev: any) => ({
                        ...prev,
                        staticQrValue: e.target.value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Concatenate Columns for QR</Label>
                  <Select
                    value={labelConfig.dynamicQrFields.join(",")}
                    onValueChange={(value) =>
                      setLabelConfig((prev: any) => ({
                        ...prev,
                        dynamicQrFields: value
                          ? value.split(",")
                          : [],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select columns" />
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

              <div className="space-y-2">
                <Label>QR Size</Label>
                <Slider
                  value={[labelConfig.qrSize]}
                  min={40}
                  max={200}
                  step={5}
                  disabled={labelConfig.autoSize}
                  onValueChange={([v]) =>
                    setLabelConfig((prev: any) => ({
                      ...prev,
                      qrSize: v,
                    }))
                  }
                />
              </div>
            </div>

            {/* QR Presets Section */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Quick QR Styles</Label>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {PRESET_CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-2 py-1 rounded-full text-xs transition-all ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="relative">
                {filteredPresets.length > 5 && (
                  <>
                    <button
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background border shadow flex items-center justify-center"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background border shadow flex items-center justify-center"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </>
                )}

                <div
                  ref={setScrollContainer}
                  className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide"
                  style={{ scrollBehavior: "smooth" }}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredPresets.slice(0, 10).map((preset) => (
                      <QRCard key={preset.id} preset={preset} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ADVANCED QR STYLES */}
            <QRStylePanel
              styleConfig={styleConfig}
              setStyleConfig={setStyleConfig}
            />
          </>
        )}

        {/* LAYOUT TAB */}
        {activeStyleTab === "layout" && (
          <div className="space-y-4">
            <Label>Choose Layout</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(layoutPresets).map(
                ([key, preset]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setLabelConfig((prev: any) => ({
                        ...prev,
                        layout: key,
                      }))
                    }
                    className={`p-2 rounded-lg border-2 text-left transition-all ${
                      labelConfig.layout === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs font-medium block">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {preset.description}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* STYLING TAB */}
        {activeStyleTab === "fields" && (
          <div className="space-y-4">
            {/* AUTO / MANUAL SIZE TOGGLE */}
<div className="flex items-center justify-between">
  <Label>Auto Size</Label>
  <Switch
    checked={labelConfig.autoSize}
    onCheckedChange={(checked) =>
      setLabelConfig((prev: any) => ({
        ...prev,
        autoSize: checked,
        ...(checked
          ? { labelWidth: undefined, labelHeight: undefined }
          : {}),
      }))
    }
  />
</div>

            <Label>QR Colors</Label>
            <input
              type="color"
              value={labelConfig.qrColor}
              onChange={(e) =>
                setLabelConfig((prev: any) => ({
                  ...prev,
                  qrColor: e.target.value,
                }))
              }
            />

            <Label>Border Width</Label>
            <Slider
              value={[labelConfig.borderWidth]}
              min={0}
              max={6}
              step={1}
              onValueChange={([v]) =>
                setLabelConfig((prev: any) => ({
                  ...prev,
                  borderWidth: v,
                }))
              }
            />

            <Label>Label Width (mm)</Label>
            <Slider
            disabled={labelConfig.autoSize}
              value={[labelConfig.labelWidth]}
              min={20}
              max={150}
              step={1}
              onValueChange={([v]) =>
                setLabelConfig((prev: any) => ({
                  ...prev,
                  labelWidth: v,
                }))
              }
            />

            <Label>Label Height (mm)</Label>
            <Slider
            
              value={[labelConfig.labelHeight]}
              min={15}
              max={100}
              step={1}
              onValueChange={([v]) =>
                setLabelConfig((prev: any) => ({
                  ...prev,
                  labelHeight: v,
                }))
              }
            />
          </div>
        )}

        {/* PRINT TAB */}
        {activeStyleTab === "print" && (
          <PrintSettings
            config={printConfig}
            onChange={setPrintConfig}
            onManualResize={() => setAutoPreviewSize(false)}   // ✅ auto → manual
          />
        )}
      </div>
    </motion.div>
  );
}
