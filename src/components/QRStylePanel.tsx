import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  QR_PRESETS,
  PRESET_CATEGORIES,
  getPresetsByCategory,
  type Preset,
  type CategoryFilter,
} from "@/data/presets";
import StyledQR from "./StyledQR";

type Props = {
  styleConfig: any;
  setStyleConfig: (v: any) => void;
};

const DOT_TYPES = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_TYPES = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

export default function QRStylePanel({ styleConfig, setStyleConfig }: Props) {
  const [activeTab, setActiveTab] = useState<"dots" | "colors" | "logo" | "presets">("dots");
  const [colorPickerSection, setColorPickerSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [previewPreset, setPreviewPreset] = useState<Preset | null>(null);

  const updateSection = (section: string, patch: any) => {
    setStyleConfig((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  };

  const applyPreset = (preset: Preset) => {
    setStyleConfig(preset.config);
    setPreviewPreset(null);
    toast.success(`Applied "${preset.name}" style`);
  };

  const filteredPresets = getPresetsByCategory(selectedCategory);

  const ColorPickerButton = ({
    color,
    onChange,
    label,
  }: {
    color: string;
    onChange: (c: string) => void;
    label: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-white hover:border-primary transition-colors"
        >
          <div
            className="w-6 h-6 rounded-md border shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium flex-1 text-left">{label}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {color.toUpperCase()}
          </span>
        </button>
        {isOpen && (
          <div 
            className="fixed z-50 p-4 bg-white rounded-lg shadow-xl border"
            style={{ 
              top: position.top,
              left: position.left,
              maxWidth: '280px'
            }}
          >
            <HexColorPicker color={color} onChange={onChange} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full mt-2"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    );
  };

  const PresetCard = ({ preset }: { preset: Preset }) => {
    const isSelected = JSON.stringify(styleConfig) === JSON.stringify(preset.config);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative group cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 ${
          isSelected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => applyPreset(preset)}
      >
        {/* Preview Area */}
        <div
          className="aspect-square p-3 flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${preset.previewColors.background} 0%, ${preset.previewColors.background} 100%)`,
          }}
        >
          {/* Mini QR Preview */}
          <div className="transform scale-75 opacity-90">
            <StyledQR
              value="https://example.com"
              size={80}
              styleConfig={preset.config}
            />
          </div>

          {/* Hover Overlay */}
          <AnimatePresence>
            {(isHovered || isSelected) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                {isSelected ? (
                  <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Selected
                  </div>
                ) : (
                  <div className="bg-white text-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Apply
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preset Info */}
        <div className="p-3 bg-card border-t border-border">
          <p className="font-medium text-sm truncate">{preset.name}</p>
          <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
        </div>

        {/* Color Indicators */}
        <div className="absolute top-2 right-2 flex gap-0.5">
          <div
            className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
            style={{ backgroundColor: preset.previewColors.primary }}
          />
          <div
            className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
            style={{ backgroundColor: preset.previewColors.secondary }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="card-clean overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Customize QR Code</h3>
        <p className="text-sm text-muted-foreground">
          Make your QR code unique
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "dots", label: "Style" },
          { id: "presets", label: "Presets", icon: Sparkles },
          { id: "colors", label: "Colors" },
          { id: "logo", label: "Logo" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto">
        {/* Style Tab */}
        {activeTab === "dots" && (
          <div className="space-y-5">
            {/* Dot Style */}
            <div className="space-y-3">
              <Label className="label-clean">Pattern Style</Label>
              <Select
                value={styleConfig.dots.type}
                onValueChange={(v) => updateSection("dots", { type: v })}
              >
                <SelectTrigger className="input-clean">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Corner Squares */}
            <div className="space-y-3">
              <Label className="label-clean">Corner Squares</Label>
              <Select
                value={styleConfig.cornersSquare.type}
                onValueChange={(v) => updateSection("cornersSquare", { type: v })}
              >
                <SelectTrigger className="input-clean">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORNER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Corner Dots */}
            <div className="space-y-3">
              <Label className="label-clean">Corner Dots</Label>
              <Select
                value={styleConfig.cornersDot.type}
                onValueChange={(v) => updateSection("cornersDot", { type: v })}
              >
                <SelectTrigger className="input-clean">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORNER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredPresets.map((preset) => (
                  <motion.div
                    key={preset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PresetCard preset={preset} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Preset Count */}
            <p className="text-xs text-muted-foreground text-center">
              Showing {filteredPresets.length} presets
            </p>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === "colors" && (
          <div className="space-y-5">
            {/* Main Color */}
            <div className="space-y-3">
              <Label className="label-clean">Main Color</Label>
              <ColorPickerButton
                color={styleConfig.dots.color}
                onChange={(c) => updateSection("dots", { color: c })}
                label="Pattern Color"
              />
            </div>

            {/* Corner Color */}
            <div className="space-y-3">
              <Label className="label-clean">Corner Color</Label>
              <ColorPickerButton
                color={styleConfig.cornersSquare.color}
                onChange={(c) => updateSection("cornersSquare", { color: c })}
                label="Corner Color"
              />
            </div>

            {/* Background */}
            <div className="space-y-3">
              <Label className="label-clean">Background</Label>
              <ColorPickerButton
                color={styleConfig.background.color}
                onChange={(c) => updateSection("background", { color: c })}
                label="Background Color"
              />
            </div>

            {/* Gradient Toggle */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">Use Gradient</p>
                <p className="text-xs text-muted-foreground">
                  Add a color gradient effect
                </p>
              </div>
              <Switch
                checked={styleConfig.dots.gradientEnabled}
                onCheckedChange={(v) => updateSection("dots", { gradientEnabled: v })}
              />
            </div>

            {/* Gradient Colors */}
            {styleConfig.dots.gradientEnabled && (
              <div className="space-y-3 pt-2">
                <ColorPickerButton
                  color={styleConfig.dots.gradientColor1}
                  onChange={(c) => updateSection("dots", { gradientColor1: c })}
                  label="Gradient Start"
                />
                <ColorPickerButton
                  color={styleConfig.dots.gradientColor2}
                  onChange={(c) => updateSection("dots", { gradientColor2: c })}
                  label="Gradient End"
                />
              </div>
            )}
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === "logo" && (
          <div className="space-y-5">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="label-clean">Upload Logo</Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64 = ev.target?.result as string;
                      setStyleConfig((prev: any) => ({
                        ...prev,
                        logo: { ...prev.logo, src: base64 },
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  {styleConfig.logo.src ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 mx-auto bg-white rounded-lg border flex items-center justify-center">
                        <img
                          src={styleConfig.logo.src}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WebP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Size */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="label-clean">Logo Size</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(styleConfig.logo.size * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={styleConfig.logo.size}
                onChange={(e) =>
                  setStyleConfig((prev: any) => ({
                    ...prev,
                    logo: { ...prev.logo, size: Number(e.target.value) },
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Logo Margin */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="label-clean">Logo Margin</Label>
                <span className="text-xs text-muted-foreground">
                  {styleConfig.logo.margin}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={styleConfig.logo.margin}
                onChange={(e) =>
                  setStyleConfig((prev: any) => ({
                    ...prev,
                    logo: { ...prev.logo, margin: Number(e.target.value) },
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Hide Background Dots */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">Clear Area</p>
                <p className="text-xs text-muted-foreground">
                  Hide dots behind logo
                </p>
              </div>
              <Switch
                checked={styleConfig.logo.hideBackgroundDots}
                onCheckedChange={(v) =>
                  setStyleConfig((prev: any) => ({
                    ...prev,
                    logo: { ...prev.logo, hideBackgroundDots: v },
                  }))
                }
              />
            </div>

            {/* Remove Logo */}
            {styleConfig.logo.src && (
              <Button
                variant="outline"
                onClick={() =>
                  setStyleConfig((prev: any) => ({
                    ...prev,
                    logo: { ...prev.logo, src: "" },
                  }))
                }
                className="w-full text-destructive"
              >
                Remove Logo
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

