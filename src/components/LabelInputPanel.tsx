import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Database,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Type,
  X,
  Sparkles,
  Settings,
  GripHorizontal,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FileUploader } from "./FileUploader";

import { LabelConfig, LabelField } from "./LabelMaker";
type Props = {
  uploadedData: Record<string, string>[];
  availableColumns: string[];
  showDataPreview: boolean;
  setShowDataPreview: (v: boolean) => void;

  labelConfig: LabelConfig;
  setLabelConfig: (fn: ((prev: LabelConfig) => LabelConfig)) => void;

  addField: () => void;
  updateField: (id: string, patch: Partial<LabelField>) => void;
  removeField: (id: string) => void;

  handleDataLoaded: (data: Record<string, string>[]) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearLogo: () => void;
  clearData: () => void;
  
  // AI Layout props
  applyAiLayout: () => void;
  isAiThinking: boolean;
  generationMode?: "single" | "batch";
};

export default function LabelInputPanel({
  uploadedData,
  availableColumns,
  showDataPreview,
  setShowDataPreview,
  labelConfig,
  setLabelConfig,
  addField,
  updateField,
  removeField,
  handleDataLoaded,
  handleLogoUpload,
  clearLogo,
  clearData,
  applyAiLayout,
  isAiThinking,
  generationMode = "batch",
}: Props) {
  if (generationMode === "single") {
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Magic AI Layout for Single */}
        {labelConfig.aiNote && !isAiThinking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-3 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-500" />
              {labelConfig.aiNote}
            </p>
          </motion.div>
        )}

        {/* Content Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-bold flex items-center gap-2 text-foreground">
              <Type className="w-4 h-4 text-primary" />
              Content Details
            </h3>
            <button
              onClick={applyAiLayout}
              disabled={isAiThinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 ${
                isAiThinking ? "opacity-70" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Magic Layout
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {/* Heading Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Label Heading</Label>
              <Input
                value={labelConfig.heading}
                onChange={(e) =>
                  setLabelConfig((p: LabelConfig) => ({
                    ...p,
                    heading: e.target.value,
                  }))
                }
                placeholder="Optional top heading"
                className="input-float h-9"
              />
            </div>

            {/* Dynamic Fields */}
            {labelConfig.fields.map((field: LabelField) => (
              <div key={field.id} className="space-y-1.5 relative group">
                <div className="flex items-center justify-between">
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="h-6 w-1/3 text-xs bg-transparent border-none p-0 focus-visible:ring-0 text-muted-foreground font-medium"
                  />
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Input
                  value={field.value}
                  onChange={(e) => updateField(field.id, { value: e.target.value })}
                  placeholder={`Enter ${field.name.toLowerCase()}`}
                  className="input-float h-9"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addField}
              className="w-full mt-2 border-dashed text-muted-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Detail
            </Button>
          </div>
        </motion.div>

        {/* Logo Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground">Logo (Optional)</h3>
          </div>
          {labelConfig.logo ? (
            <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-lg border border-border">
              <div className="w-16 h-16 rounded-xl border bg-white flex items-center justify-center p-1 relative">
                <img
                  src={labelConfig.logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Logo Size</Label>
                <Slider
                  value={[labelConfig.logoSize]}
                  onValueChange={(v) =>
                    setLabelConfig((p: LabelConfig) => ({ ...p, logoSize: v[0] }))
                  }
                  min={10} max={30} step={1}
                />
              </div>
              <button onClick={clearLogo} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all group">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-2" />
              <span className="text-xs font-medium group-hover:text-primary">Click to upload logo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          )}
        </motion.div>
      </div>
    );
  }

  // ==== BATCH MODE ====
  return (
    <div className="flex flex-col gap-4 overflow-hidden w-full">
      {/* ===== AI Magic Layout Button ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="glass-card p-3 rounded-xl"
      >
        <motion.button
          onClick={applyAiLayout}
          disabled={isAiThinking}
          whileHover={!isAiThinking ? { scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" } : {}}
          whileTap={!isAiThinking ? { scale: 0.98 } : {}}
          className={`
            w-full relative overflow-hidden rounded-lg
            bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600
            border-2 border-transparent
            transition-all duration-300
            group
            ${isAiThinking ? 'opacity-80' : ''}
          `}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <div className="relative flex items-center justify-center gap-3 py-3 px-4">
            {isAiThinking ? (
              <>
                {/* Sassy loading animation */}
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5, repeat: Infinity }
                  }}
                  className="relative"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white font-semibold">
                  AI is thinking...
                </span>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Wand2 className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white font-semibold">
                  Magic AI Layout
                </span>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="absolute right-3"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </>
            )}
          </div>
        </motion.button>
        
        {/* AI Note display */}
        {labelConfig.aiNote && !isAiThinking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-500" />
              {labelConfig.aiNote}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ===== Row: Data + Logo ===== */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {/* Data Source - Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                Data Source
              </h2>

            {uploadedData.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearData}
                title="Clear data"
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <FileUploader onDataLoaded={handleDataLoaded} />

          {uploadedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3"
            >
              <Collapsible
                open={showDataPreview}
                onOpenChange={setShowDataPreview}
              >
                <CollapsibleTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="font-medium">{uploadedData.length} rows loaded</span>
                    </div>
                    {showDataPreview ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </motion.button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                  <div className="max-h-40 overflow-auto rounded-lg border border-border bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/50 sticky top-0 z-10">
                        <tr>
                          {availableColumns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left font-medium text-foreground whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-t border-border">
                            {availableColumns.map((col) => (
                              <td
                                key={col}
                                className="px-3 py-2 truncate max-w-[120px]"
                              >
                                {row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {uploadedData.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-2 bg-secondary/30 border-t border-border">
                        ... and {uploadedData.length - 5} more rows
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}
        </motion.div>

      {/* Logo Upload - Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 rounded-xl"
        >
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-accent" />
            </div>
            Logo (Optional)
          </h2>

          {labelConfig.logo ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl border overflow-hidden bg-white flex items-center justify-center shadow-sm relative">
                <img
                  src={labelConfig.logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
                {/* Logo ratio badge */}
                {labelConfig.logoRatio && labelConfig.logoRatio !== 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                    {labelConfig.logoRatio > 1 ? 'Landscape' : 'Portrait'}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-3 h-3 text-muted-foreground" />
                  <Label className="text-xs">Size</Label>
                </div>
                <Slider
                  value={[labelConfig.logoSize]}
                  onValueChange={(v) =>
                    setLabelConfig((p: LabelConfig) => ({
                      ...p,
                      logoSize: v[0],
                    }))
                  }
                  min={10}
                  max={30}
                  step={1}
                  className="py-1"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {labelConfig.logoSize}%
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearLogo}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all group"
            >
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                <Upload className="w-5 h-5" />
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1.5 font-medium group-hover:text-primary transition-colors">Upload Logo</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</span>

              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleLogoUpload}
              />
            </motion.label>
          )}
        </motion.div>
      </div>

      {/* ===== Label Heading ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 rounded-xl"
      >
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Type className="w-4 h-4 text-amber-500" />
          </div>
          Label Heading
        </h3>

        <motion.div whileFocus={{ scale: 1.01 }}>
          <Input
            value={labelConfig.heading}
            onChange={(e) =>
              setLabelConfig((p: LabelConfig) => ({
                ...p,
                heading: e.target.value,
              }))
            }
            placeholder="Enter heading (shown on all labels)"
            className="input-float"
          />
        </motion.div>
      </motion.div>

      {/* ===== Label Fields ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 rounded-xl flex-1 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <GripHorizontal className="w-4 h-4 text-green-500" />
            </div>
            Label Fields
          </h3>
          <div className="flex items-center gap-2">
            {/* AI Magic Layout Button near Add Field */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={applyAiLayout}
              disabled={isAiThinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg transition-all ${isAiThinking ? 'opacity-70' : ''}`}
              title="AI Magic Layout - Auto-optimize your label"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Magic Layout
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addField}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-3 pr-1 scrollbar-hide">
          {labelConfig.fields.map((field: LabelField, index: number) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateField(field.id, { name: e.target.value })
                      }
                      className="h-8 text-xs"
                      placeholder="Field name"
                    />
                  </motion.div>
                  <motion.div whileFocus={{ scale: 1.02 }} className="flex-[2]">
                    <Input
                      value={field.value}
                      onChange={(e) =>
                        updateField(field.id, { value: e.target.value })
                      }
                      className="h-8 text-xs"
                      placeholder="Value"
                    />
                  </motion.div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[10px]">Size</Label>
                    <motion.div whileFocus={{ scale: 1.05 }}>
                      <Input
                        type="number"
                        value={field.fontSize}
                        onChange={(e) =>
                          updateField(field.id, {
                            fontSize: parseInt(e.target.value) || 12,
                          })
                        }
                        className="h-7 w-14 text-xs"
                      />
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Label className="text-[10px]">Bold</Label>
                    <Switch
                      checked={field.bold}
                      onCheckedChange={(checked) =>
                        updateField(field.id, { bold: checked })
                      }
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {labelConfig.fields.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="space-y-2">
              <Sparkles className="w-8 h-8 text-primary/50 mx-auto" />
              <p className="text-sm text-muted-foreground">
                No fields yet. Click "Add Field" to create one.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

