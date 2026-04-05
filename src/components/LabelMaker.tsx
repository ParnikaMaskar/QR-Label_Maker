import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { PrintConfig, defaultPrintConfig, PrintSettings } from "./PrintSettings";
import StyledQR, { generateStyledQRDataUrl, StyleConfig } from "./StyledQR";
import LabelInputPanel from "./LabelInputPanel";
import LabelPreviewPanel from "./LabelPreviewPanel";
import LabelStylePanel from "./LabelStylePanel";
import { runAiMagicLayout, getLogoDimensions, getLogoRatio, validateContentFit, AIConfigOutput } from "@/lib/aiLayoutEngine";
import { Sparkles, Check, ChevronDown, ListPlus, Palette, Printer, Type, Download } from "lucide-react";

/* ============================================================
   Types
============================================================ */

type LayoutType =
  | "horizontal"
  | "vertical"
  | "qr-only"
  | "address"
  | "product-tag"
  | "2x4-label";

type QRCodeType =
  | "model1"
  | "model2"
  | "micro"
  | "iqr"
  | "sqrc"
  | "frame";

export interface LabelField {
  id: string;
  name: string;
  value: string;
  fontSize: number;
  bold: boolean;
}

export interface LabelConfig {
  layout: LayoutType;
  fields: LabelField[];
  qrMode: "static" | "dynamic";
  staticQrValue: string;
  dynamicQrFields: string[];
  qrSize: number;
  qrCodeType: QRCodeType;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  logo: string;
  logoSize: number;
  qrColor: string;
  qrBgColor: string;
  heading: string;
  borderWidth: number;
  borderColor: string;
  qrShape: "square" | "circle";
  qrStyle:
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";
  autoSize: boolean;
  labelWidth?: number;
  labelHeight?: number;
  // AI-derived values
  baseFontSize?: number;
  padding?: number;
  gap?: number;
  logoRatio?: number;
  aiNote?: string;
  minFontSize?: number;
  textColor?: string;
  suggestedWidth?: number;
  suggestedHeight?: number;
  needsExpansion?: boolean;
  // Horizontal layout width percentages (for visual weight balance)
  leftWidthPercent?: number;   // QR/Logo section width %
  rightWidthPercent?: number;  // Text section width %
}

/* ============================================================
   Layout Presets
============================================================ */

const layoutPresets: Record<
  LayoutType,
  { name: string; description: string }
> = {
  horizontal: { name: "Horizontal", description: "QR on left, text on right" },
  vertical: { name: "Vertical", description: "Text, QR, footer stacked" },
  "qr-only": { name: "QR Only", description: "Just the QR code" },
  address: { name: "Address Label", description: "Multi-line address format" },
  "product-tag": { name: "Product Tag", description: "Name, price, QR" },
  "2x4-label": { name: "2x4 Label", description: "Compact shipping label" },
};

const defaultFields: LabelField[] = [
  { id: "1", name: "Title", value: "Product Name", fontSize: 16, bold: true },
  {
    id: "2",
    name: "Subtitle",
    value: "Description",
    fontSize: 12,
    bold: false,
  },
  {
    id: "3",
    name: "Footer",
    value: "Scan for info",
    fontSize: 10,
    bold: false,
  },
];

/* ============================================================
   Component
============================================================ */

// Stepper Component
const AccordionStep = ({
  stepNum,
  title,
  subtitle,
  isActive,
  isCompleted,
  onClick,
  children,
}: {
  stepNum: number;
  title: string;
  subtitle?: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className={`card-modern overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-primary/20 bg-white/80' : 'bg-white/40 hover:bg-white/60 cursor-pointer'}`}>
      <div className="p-5 flex items-center justify-between select-none" onClick={onClick}>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isActive ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md' : isCompleted ? 'bg-success text-white' : 'bg-secondary text-muted-foreground'}`}>
            {isCompleted && !isActive ? <Check className="w-4 h-4" /> : stepNum}
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground line-clamp-1">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="p-5 pt-0 border-t border-border/50 flex flex-col gap-4">
              {children}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LabelMaker = () => {
  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const advanceToStep = useCallback((step: number) => {
    setCompletedSteps(prev => Array.from(new Set([...prev, step - 1])));
    setActiveStep(step);
  }, []);
  const [labelConfig, setLabelConfig] = useState<LabelConfig>({
    layout: "horizontal",
    fields: defaultFields,
    qrMode: "static",
    staticQrValue: "https://example.com",
    dynamicQrFields: [],
    qrSize: 80,
    qrCodeType: "model2",
    errorCorrectionLevel: "M",
    logo: "",
    logoSize: 20,
    qrColor: "#000000",
    qrBgColor: "#ffffff",
    heading: "DEVICE LABEL",
    borderWidth: 1,
    borderColor: "#000000",
    qrShape: "square",
    qrStyle: "square",
    autoSize: true,
    labelWidth: undefined,
    labelHeight: undefined,
    baseFontSize: 14,
    padding: 12,
    gap: 8,
    logoRatio: 1,
    aiNote: "",
    minFontSize: 6,
    textColor: "#000000",
    suggestedWidth: 50,
    suggestedHeight: 30,
    needsExpansion: false,
    // Default horizontal layout width percentages
    leftWidthPercent: 40,
    rightWidthPercent: 60,
  });

  const [autoPreviewSize, setAutoPreviewSize] = useState(true);
  const [printConfig, setPrintConfig] =
    useState<PrintConfig>(defaultPrintConfig);

  const [uploadedData, setUploadedData] = useState<
    Record<string, string>[]
  >([]);

  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showStyleSettings, setShowStyleSettings] = useState(false);

  const [activeStyleTab, setActiveStyleTab] = useState<
    "layout" | "fields" | "qr" | "print"
  >("layout");

  // AI loading state for "sassy" animation
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Generation Mode
  const [generationMode, setGenerationMode] = useState<"single" | "batch">("single");

  const printRef = useRef<HTMLDivElement>(null);

  const [styleConfig, setStyleConfig] = useState<StyleConfig>({

    dots: {
      type: "rounded",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,

      gradientColor1: "#000000",
      gradientColor2: "#000000",
    },
    cornersSquare: {
      type: "extra-rounded",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,

      gradientColor1: "#000000",
      gradientColor2: "#000000",
    },
    cornersDot: {
      type: "dot",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,

      gradientColor1: "#000000",
      gradientColor2: "#000000",
    },
    background: {
      color: "#ffffff",
      gradientEnabled: false,
      gradientType: "linear" as const,

      gradientColor1: "#ffffff",
      gradientColor2: "#ffffff",
    },
    logo: {
      src: "",
      size: 0.3,
      margin: 5,
      hideBackgroundDots: true,
    },
  });

  // Sync labelConfig.qrColor with styleConfig
  useEffect(() => {
    setStyleConfig((prev) => ({
      ...prev,
      dots: { ...prev.dots, color: labelConfig.qrColor },
      cornersSquare: { ...prev.cornersSquare, color: labelConfig.qrColor },
      cornersDot: { ...prev.cornersDot, color: labelConfig.qrColor },
    }));
  }, [labelConfig.qrColor]);

  /* ============================================================
     AI Layout Functions
  ============================================================ */

  /**
   * Apply AI-generated layout configuration with print-safe sizing
   */
  const applyAiLayout = useCallback(() => {
    setIsAiThinking(true);

    // Simulate "thinking" time for sassy animation
    setTimeout(() => {
      // Prepare input for AI engine - use current print config dimensions
      const aiInput = {
        fields: uploadedData.length > 0 ? uploadedData : [{
          Title: labelConfig.fields[0]?.value || "",
          Subtitle: labelConfig.fields[1]?.value || "",
          Footer: labelConfig.fields[2]?.value || "",
        }],
        hasLogo: !!labelConfig.logo,
        logoRatio: labelConfig.logoRatio || 1,
        canvasWidth: printConfig.labelWidth,
        canvasHeight: printConfig.labelHeight,
        qrBgColor: labelConfig.qrBgColor,
        labelWidth: printConfig.labelWidth,
        labelHeight: printConfig.labelHeight,
      };

      // Run AI layout engine
      const aiOutput = runAiMagicLayout(aiInput);

      // Calculate content fit validation
      const contentToValidate = labelConfig.fields.map((field) => ({
        text: field.value || field.name,
        fontSize: field.fontSize,
      }));

      const fitValidation = validateContentFit(
        contentToValidate,
        printConfig.labelWidth,
        printConfig.labelHeight,
        aiOutput.qrSize,
        aiOutput.layout,
        !!labelConfig.logo
      );

      // Update state with AI decisions
      setLabelConfig((prev) => ({
        ...prev,
        layout: aiOutput.layout,
        baseFontSize: aiOutput.baseFontSize,
        qrSize: aiOutput.qrSize,
        padding: aiOutput.padding,
        gap: aiOutput.gap,
        aiNote: aiOutput.aiNote,
        minFontSize: aiOutput.minFontSize,
        textColor: aiOutput.textColor,
        suggestedWidth: aiOutput.suggestedWidth,
        suggestedHeight: aiOutput.suggestedHeight,
        needsExpansion: aiOutput.needsExpansion,
        // Update horizontal layout width percentages
        leftWidthPercent: aiOutput.leftWidthPercent,
        rightWidthPercent: aiOutput.rightWidthPercent,
        // Update field font sizes based on AI recommendation
        fields: prev.fields.map((field, idx) => ({
          ...field,
          fontSize: idx === 0
            ? Math.max(aiOutput.baseFontSize, field.fontSize)
            : field.fontSize,
        })),
      }));

      // Build toast message with AI reasoning and suggestions
      let toastDescription = `Layout: ${aiOutput.layout} | Font: ${aiOutput.baseFontSize}px | QR: ${aiOutput.qrSize}px`;

      if (aiOutput.needsExpansion) {
        toastDescription += `\nSuggested size: ${aiOutput.suggestedWidth}mm × ${aiOutput.suggestedHeight}mm`;
      }

      if (aiOutput.warnings.length > 0) {
        toastDescription = `${aiOutput.warnings.join('\n')}`;
      }

      // Show toast with AI reasoning
      toast.success(aiOutput.aiNote, {
        description: toastDescription,
        duration: 5000,
      });

      // If label needs expansion, offer to resize
      if (aiOutput.needsExpansion) {
        toast.info(`AI suggests: ${aiOutput.suggestedWidth}mm × ${aiOutput.suggestedHeight}mm for best fit`, {
          duration: 6000,
          action: {
            label: "Apply",
            onClick: () => {
              setPrintConfig((prev) => ({
                ...prev,
                labelWidth: aiOutput.suggestedWidth,
                labelHeight: aiOutput.suggestedHeight,
              }));
              toast.success("Label size updated!");
            },
          },
        });
      }

      setIsAiThinking(false);
    }, 1000); // 1 second "thinking" animation
  }, [uploadedData, labelConfig, printConfig.labelWidth, printConfig.labelHeight]);

  /**
   * Update logo with dimension detection
   */
  const handleLogoUploadWithDetection = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Detect logo dimensions
        const dimensions = await getLogoDimensions(file);
        const ratio = getLogoRatio(dimensions.width, dimensions.height);

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;

          setLabelConfig((prev) => ({
            ...prev,
            logo: result,
            logoRatio: ratio,
          }));
          setStyleConfig((prev) => ({
            ...prev,
            logo: { ...prev.logo, src: result },
          }));

          toast.success("Logo uploaded!", {
            description: `Detected ${dimensions.width}x${dimensions.height}px (Ratio: ${ratio.toFixed(2)})`,
          });
        };

        reader.readAsDataURL(file);
      } catch (error) {
        toast.error("Failed to process logo");
        console.error(error);
      }

      event.target.value = "";
    },
    []
  );

  /* ============================================================
     Constants
     ============================================================ */
  const PX_PER_MM = 3.78; // 96 DPI standard

  /* ============================================================
     Helpers
  ============================================================ */

  const availableColumns = useMemo(() => {
    if (uploadedData.length === 0) return [];
    return Object.keys(uploadedData[0]);
  }, [uploadedData]);

  const clearData = useCallback(() => {
    setUploadedData([]);
    setShowDataPreview(false);

    setLabelConfig((prev) => ({
      ...prev,
      fields: defaultFields,
      dynamicQrFields: [],
    }));

    toast.success("Data cleared");
  }, []);

  const updateField = (id: string, updates: Partial<LabelField>) => {
    setLabelConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  };

  const addField = () => {
    const newField: LabelField = {
      id: Date.now().toString(),
      name: `Field ${labelConfig.fields.length + 1}`,
      value: "",
      fontSize: 12,
      bold: false,
    };
    setLabelConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const removeField = (id: string) => {
    setLabelConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const getFieldValue = (
    field: LabelField,
    rowData?: Record<string, string>
  ) => {
    if (!rowData) return field.value;
    if (availableColumns.includes(field.name) && !field.value) {
      return rowData[field.name] || "";
    }
    return field.value;
  };

  const getQrValue = (rowData?: Record<string, string>) => {
    if (labelConfig.qrMode === "static") {
      return labelConfig.staticQrValue || "https://example.com";
    }
    if (!rowData) return "https://example.com";

    return labelConfig.dynamicQrFields
      .map((field) => rowData[field] || "")
      .filter(Boolean)
      .join("-");
  };

  /* ============================================================
     Label Renderer
  ============================================================ */

  const renderSingleLabel = (
    rowData?: Record<string, string>,
    index?: number
  ) => {
    const qrValue = getQrValue(rowData);

    const labelWidthPx = (generationMode === "batch" ? printConfig.labelWidth : (labelConfig.labelWidth || 50)) * PX_PER_MM;
    const labelHeightPx = (generationMode === "batch" ? printConfig.labelHeight : (labelConfig.labelHeight || 30)) * PX_PER_MM;
    const maxQrSize = Math.min(labelWidthPx, labelHeightPx) * 0.75;

    // Use AI-derived qrSize if available, otherwise fall back to config
    const qrSize = labelConfig.autoSize
      ? Math.min(maxQrSize, 100)
      : labelConfig.qrSize;

    // Use AI-derived font size
    const baseFontSize = labelConfig.baseFontSize || 14;
    const padding = labelConfig.padding || 12;
    const gap = labelConfig.gap || 8;

    const qr = (
      <StyledQR
        value={qrValue || "https://example.com"}
        size={qrSize}
        styleConfig={styleConfig}
      />
    );

    const renderField = (field: LabelField, idx: number) => (
      <p
        key={field.id}
        style={{
          fontSize: `${field.fontSize}px`,
          fontWeight: field.bold ? 600 : 400,
          margin: 0,
          lineHeight: 1.25,
          color: labelConfig.textColor || 'inherit',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        <strong>{field.name}:</strong>{" "}
        {getFieldValue(field, rowData)}
      </p>
    );

    let content: React.ReactNode = null;

    // Get layout class based on AI decision
    const layoutClass = labelConfig.layout === 'horizontal'
      ? 'flex items-center'
      : labelConfig.layout === 'vertical'
        ? 'flex flex-col items-center text-center'
        : labelConfig.layout === 'qr-only'
          ? 'flex justify-center'
          : 'flex items-center';

    const innerGap = `${gap}px`;

    switch (labelConfig.layout) {
      case "horizontal": {
        // Get AI-derived width percentages for visual balance
        const leftWidth = labelConfig.leftWidthPercent || 40;
        const rightWidth = labelConfig.rightWidthPercent || 60;

        content = (
          <div className={layoutClass}>
            {/* QR/Logo Section - Left */}
            <div
              className="flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ width: `${leftWidth}%`, marginRight: innerGap }}
            >
              {qr}
            </div>
            {/* Text Section - Right */}
            <div
              className="flex flex-col overflow-hidden"
              style={{ width: `${rightWidth}%`, gap: '2px' }}
            >
              {labelConfig.fields.map((field, idx) => renderField(field, idx))}
            </div>
          </div>
        );
        break;
      }

      case "vertical":
        content = (
          <div className={layoutClass} style={{ gap: innerGap }}>
            {labelConfig.fields[0] &&
              renderField(labelConfig.fields[0], 0)}
            {labelConfig.fields[1] &&
              renderField(labelConfig.fields[1], 1)}
            {qr}
            {labelConfig.fields[2] &&
              renderField(labelConfig.fields[2], 2)}
          </div>
        );
        break;

      case "qr-only":
        content = <div className={layoutClass}>{qr}</div>;
        break;

      case "address":
      case "2x4-label":
        content = (
          <div className={layoutClass} style={{ gap: innerGap }}>
            {qr}
            <div className="flex flex-col overflow-hidden" style={{ gap: '2px' }}>
              {labelConfig.fields.map((field, idx) => renderField(field, idx))}
            </div>
          </div>
        );
        break;

      case "product-tag":
        content = (
          <div className={layoutClass} style={{ gap: innerGap }}>
            {labelConfig.fields[0] &&
              renderField(labelConfig.fields[0], 0)}
            {qr}
            <div className="flex flex-col overflow-hidden" style={{ gap: '2px' }}>
              {labelConfig.fields.slice(1).map((field, idx) => renderField(field, idx + 1))}
            </div>
          </div>
        );
        break;
    }

    const manualWidthPx = (generationMode === "batch" ? printConfig.labelWidth : (!labelConfig.autoSize ? labelConfig.labelWidth : undefined)) * PX_PER_MM;
    const manualHeightPx = (generationMode === "batch" ? printConfig.labelHeight : (!labelConfig.autoSize ? labelConfig.labelHeight : undefined)) * PX_PER_MM;

    return (
      <div
        className="inline-flex flex-col justify-center rounded-lg"
        style={{
          border: `${labelConfig.borderWidth}px solid ${labelConfig.borderColor}`,
          padding: `${padding}px`,
          width: manualWidthPx ? `${manualWidthPx}px` : "fit-content",
          height: manualHeightPx ? `${manualHeightPx}px` : "fit-content",
          minWidth: manualWidthPx ? `${manualWidthPx}px` : undefined,
          minHeight: manualHeightPx ? `${manualHeightPx}px` : undefined,
          boxSizing: 'border-box',
          overflow: "hidden",
          backgroundColor: labelConfig.qrBgColor,
        }}
      >
        {labelConfig.heading?.trim() && (
          <p
            style={{
              textAlign: "center",
              fontWeight: 600,
              fontSize: `${baseFontSize}px`,
              marginBottom: "4px",
              color: labelConfig.textColor || 'inherit',
            }}
          >
            {labelConfig.heading}
          </p>
        )}

        {content}
      </div>
    );
  };

  const labelsToRender = useMemo(() => {
    if (uploadedData.length === 0) return [undefined];
    return uploadedData;
  }, [uploadedData]);

  /* ============================================================
     PRINT USING STYLED QR
  ============================================================ */

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "", "width=900,height=700");
    if (!printWindow) {
      toast.error("Could not open print window. Please allow popups for this site.");
      return;
    }

    const paperSizes: Record<string, { width: string; height: string }> =
    {
      a3: { width: "297mm", height: "420mm" },
      a4: { width: "210mm", height: "297mm" },
      a5: { width: "148mm", height: "210mm" },
      letter: { width: "8.5in", height: "11in" },
      legal: { width: "8.5in", height: "14in" },
      executive: { width: "7.25in", height: "10.5in" },
      custom: { width: "210mm", height: "297mm" },
    };

    const paper = paperSizes[printConfig.paperSize] || paperSizes.a4;

    const isSingle = generationMode === "single";
    const labelWidthMm = isSingle ? (labelConfig.labelWidth || 50) : (printConfig.labelWidth || 50);
    const labelHeightMm = isSingle ? (labelConfig.labelHeight || 30) : (printConfig.labelHeight || 30);

    const labelWidthPx = labelWidthMm * 3.78;
    const labelHeightPx = labelHeightMm * 3.78;
    const maxQrSize = Math.min(labelWidthPx, labelHeightPx) * 0.7;

    const qrSize = labelConfig.autoSize
      ? Math.min(maxQrSize, 100)
      : (labelConfig.qrSize || 80);

    const baseFontSize = labelConfig.baseFontSize || 14;
    const padding = labelConfig.padding || 12;
    const gap = labelConfig.gap || 8;
    const textColor = labelConfig.textColor || '#000000';

    const generateLabelsWithQR = async () => {
      const labelsHTML: string[] = [];

      try {
        for (let idx = 0; idx < labelsToRender.length; idx++) {
          const row = labelsToRender[idx];
          const qrValue = getQrValue(row) || "https://example.com";

          // Generate QR code - with fallback for error handling
          let qrDataUrl: string;
          try {
            qrDataUrl = await generateStyledQRDataUrl(
              qrValue,
              qrSize,
              styleConfig
            );
          } catch (qrError) {
            console.error("QR generation failed, using fallback:", qrError);
            // Fallback: use a simple QR code as data URL
            qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrValue)}`;
          }

          const fieldHtmls = labelConfig.fields.map((field) => {
            const value = getFieldValue(field, row);

            return `
              <p style="
                font-size: ${field.fontSize}px;
                font-weight: ${field.bold ? 600 : 400};
                margin: 0;
                line-height: 1.25;
                white-space: normal;
                word-break: break-word;
                color: ${textColor};
              ">
                <strong>${field.name}:</strong> ${value}
              </p>
            `;
          });

          const imgTag = `<img src="${qrDataUrl}" style="width:${qrSize}px;height:${qrSize}px;object-fit:contain;" alt="QR Code" />`;

          let contentHtml = "";

          // Get layout styles using the same logic as preview
          const layoutStyles = {
            horizontal: `display:flex;align-items:center;`,
            vertical: `display:flex;flex-direction:column;align-items:center;text-align:center;gap:${gap}px;`,
            'qr-only': 'display:flex;justify-content:center;',
            address: `display:flex;align-items:center;gap:${gap}px;`,
            '2x4-label': `display:flex;align-items:center;gap:${gap}px;`,
            'product-tag': `display:flex;flex-direction:column;align-items:center;gap:${gap}px;`,
          };

          const layoutStyle = layoutStyles[labelConfig.layout as keyof typeof layoutStyles] || layoutStyles.horizontal;

          switch (labelConfig.layout) {
            case "horizontal": {
              // Get AI-derived width percentages for print layout
              const leftWidth = labelConfig.leftWidthPercent || 40;
              const rightWidth = labelConfig.rightWidthPercent || 60;
              const leftWidthStyle = `width:${leftWidth}%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:${gap}px;`;
              const rightWidthStyle = `width:${rightWidth}%;overflow:hidden;display:flex;flex-direction:column;gap:2px;`;
              contentHtml = `<div style="${layoutStyle}"><div style="${leftWidthStyle}">${imgTag}</div><div style="${rightWidthStyle}">${fieldHtmls.join("")}</div></div>`;
              break;
            }

            case "vertical":
              contentHtml = `<div style="${layoutStyle}">${fieldHtmls.slice(0, 2).join("")}${imgTag}${fieldHtmls[2] || ""}</div>`;
              break;

            case "qr-only":
              contentHtml = `<div style="${layoutStyle}">${imgTag}</div>`;
              break;

            case "address":
            case "2x4-label":
              contentHtml = `<div style="${layoutStyle}">${imgTag}<div style="overflow:hidden;display:flex;flex-direction:column;gap:2px;">${fieldHtmls.join("")}</div></div>`;
              break;

            case "product-tag":
              contentHtml = `<div style="${layoutStyle}">${fieldHtmls[0] || ""}${imgTag}<div style="overflow:hidden;display:flex;flex-direction:column;gap:2px;">${fieldHtmls.slice(1).join("")}</div></div>`;
              break;

            default:
              contentHtml = `<div style="${layoutStyle}">${imgTag}<div>${fieldHtmls.join("")}</div></div>`;
          }

          const labelWrapper = `
            <div 
              class="label"
              style="
                border: ${labelConfig.borderWidth}px solid ${labelConfig.borderColor};
                padding: ${padding}px;
                border-radius: 8px;
                background: ${labelConfig.qrBgColor || '#ffffff'};
                width: ${labelWidthMm}mm;
                height: ${labelHeightMm}mm;
                overflow: hidden;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
                font-family: system-ui, -apple-system, sans-serif;
              "
            >
              ${labelConfig.heading?.trim()
              ? `<p style="
                    text-align:center;
                    font-weight:600;
                    font-size:${baseFontSize}px;
                    margin:0 0 4px 0;
                    color: ${textColor};
                    white-space: normal;
                    word-break: break-word;
                  ">
                    ${labelConfig.heading}
                  </p>`
              : ""
            }
              ${contentHtml}
            </div>
          `;

          labelsHTML.push(labelWrapper);
        }
      } catch (error) {
        console.error("Error generating labels:", error);
        toast.error("Failed to generate some labels");
      }

      return labelsHTML;
    };

    // Generate labels and write to print window
    generateLabelsWithQR().then((labelHTMLs) => {
      // Check if we have labels to print
      if (labelHTMLs.length === 0) {
        toast.error("No labels to print");
        printWindow.close();
        return;
      }

      // Write the print document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Labels - ${labelHTMLs.length} labels</title>
            <style>
              @page {
                size: ${paper.width} ${paper.height};
                margin: 0;
              }

              * {
                box-sizing: border-box;
              }

              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }

              body {
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
                min-height: 100vh;
              }

              .labels-container {
                position: absolute;
                top: ${printConfig.marginTop}mm;
                left: ${printConfig.marginLeft}mm;
                display: grid;
                grid-template-columns: repeat(${isSingle ? 1 : printConfig.labelsPerRow}, ${labelWidthMm}mm);
                gap: ${printConfig.gapVertical}mm ${printConfig.gapHorizontal}mm;
              }

              .label {
                width: ${labelWidthMm}mm;
                height: ${labelHeightMm}mm;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                page-break-inside: avoid;
                page-break-after: auto;
              }

              /* Print media query for better output */
              @media print {
                body {
                  background: white;
                }
                .labels-container {
                  position: relative;
                  top: 0;
                  left: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="labels-container">
              ${labelHTMLs.join("\n")}
            </div>
            <script>
              // Auto-print when page loads
              window.onload = function() {
                // Small delay to ensure images load
                setTimeout(function() {
                  window.print();
                }, 500);
              };
              
              // Error handling
              window.onerror = function(msg, url, line) {
                console.error('Print window error:', msg, url, line);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Notify success
      toast.success(`Print dialog opened! (${labelHTMLs.length} labels)`);

      // Close the toast after a delay
      setTimeout(() => {
        toast.dismiss();
      }, 2000);
    }).catch((error) => {
      console.error("Print generation error:", error);
      toast.error("Failed to generate print content");
      printWindow.close();
    });
  }, [labelsToRender, labelConfig, printConfig, styleConfig]);

  /* ============================================================
     Data + Logo handlers
  ============================================================ */

  const handleDataLoaded = useCallback(
    (data: Record<string, string>[]) => {
      setUploadedData(data);

      if (data.length > 0) {
        const cols = Object.keys(data[0]);
        const newFields: LabelField[] = cols.map((col, idx) => ({
          id: `field-${idx}`,
          name: col,
          value: "",
          fontSize: 12,
          bold: idx === 0,
        }));

        // Calculate dynamic dimensions based on data
        const estimatedWidth = Math.max(50, Math.min(100, cols.length * 15 + 20));
        const estimatedHeight = Math.max(30, Math.min(80, cols.length * 8 + 20));

        setLabelConfig((prev) => ({
          ...prev,
          dynamicQrFields: cols.slice(0, 2),
          fields: newFields,
          labelWidth: estimatedWidth,
          labelHeight: estimatedHeight,
        }));

        toast.success(
          `Loaded ${data.length} rows with ${cols.length} fields!`
        );
      }
    },
    []
  );

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleLogoUploadWithDetection(event);
    },
    [handleLogoUploadWithDetection]
  );

  const clearLogo = useCallback(() => {
    setLabelConfig((prev) => ({ ...prev, logo: "", logoRatio: 1 }));
    setStyleConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, src: "" },
    }));
    toast.success("Logo cleared");
  }, []);

  /* ============================================================
     Render
  ============================================================ */

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto items-start min-h-screen">
      {/* LEFT COLUMN: STEPPER */}
      <div className="flex-1 w-full space-y-4 max-w-2xl">

        {/* STEP 1: CHOOSE TARGET */}
        <AccordionStep
          stepNum={1}
          title="Choose Label Source"
          subtitle={generationMode === "batch" ? "Batch Generation" : "Single Label"}
          isActive={activeStep === 1}
          isCompleted={completedSteps.includes(1)}
          onClick={() => setActiveStep(1)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setGenerationMode("single");
                advanceToStep(2);
                if (uploadedData.length > 0) clearData();
              }}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${generationMode === "single"
                ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                : "border-border hover:border-primary/50 bg-white"
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${generationMode === "single" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                <Type className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground">Single Label</h4>
                <p className="text-xs text-muted-foreground mt-1">Design one custom label</p>
              </div>
            </button>
            <button
              onClick={() => {
                setGenerationMode("batch");
                advanceToStep(2);
              }}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${generationMode === "batch"
                ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                : "border-border hover:border-primary/50 bg-white"
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${generationMode === "batch" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                <ListPlus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground">Batch Labels</h4>
                <p className="text-xs text-muted-foreground mt-1">Generate many from a CSV</p>
              </div>
            </button>
          </div>
        </AccordionStep>

        {/* STEP 2: SETUP DATA & FIELDS */}
        <AccordionStep
          stepNum={2}
          title={generationMode === "batch" ? "Upload Data & Map Fields" : "Enter Content"}
          subtitle={`${labelConfig.fields.length} fields configured`}
          isActive={activeStep === 2}
          isCompleted={completedSteps.includes(2) || uploadedData.length > 0}
          onClick={() => setActiveStep(2)}
        >
          <div className="pt-2">
            <LabelInputPanel
              uploadedData={uploadedData}
              availableColumns={availableColumns}
              showDataPreview={showDataPreview}
              setShowDataPreview={setShowDataPreview}
              labelConfig={labelConfig}
              setLabelConfig={setLabelConfig}
              addField={addField}
              updateField={updateField}
              removeField={removeField}
              handleDataLoaded={(data) => {
                handleDataLoaded(data);
                advanceToStep(3);
              }}
              handleLogoUpload={handleLogoUpload}
              clearLogo={clearLogo}
              clearData={clearData}
              applyAiLayout={applyAiLayout}
              isAiThinking={isAiThinking}
              generationMode={generationMode}
            />
            {generationMode === "single" && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => advanceToStep(3)}
                  className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                >
                  Next: Design
                </button>
              </div>
            )}
          </div>
        </AccordionStep>

        {/* STEP 3: DESIGN & STYLE */}
        <AccordionStep
          stepNum={3}
          title="Design & Style"
          subtitle={`Layout: ${labelConfig.layout}`}
          isActive={activeStep === 3}
          isCompleted={completedSteps.includes(3)}
          onClick={() => setActiveStep(3)}
        >
          <div className="pt-2 space-y-4">
            <div className="glass-card mb-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Auto-Optimize?
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Let AI arrange your fields uniquely.
                  </p>
                </div>
                <button
                  onClick={applyAiLayout}
                  disabled={isAiThinking}
                  className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg ${isAiThinking ? 'opacity-70' : ''}`}
                >
                  {isAiThinking ? 'Thinking...' : 'Magic Layout'}
                </button>
              </div>
            </div>
            {/* INLINE LABEL STYLE PANEL REUSE */}
            <LabelStylePanel
              show={true}
              onClose={() => { }}
              activeStyleTab={activeStyleTab}
              setActiveStyleTab={setActiveStyleTab}
              labelConfig={labelConfig}
              setLabelConfig={setLabelConfig}
              availableColumns={availableColumns}
              printConfig={printConfig}
              setPrintConfig={setPrintConfig}
              styleConfig={styleConfig}
              setStyleConfig={setStyleConfig}
              layoutPresets={layoutPresets}
              setAutoPreviewSize={setAutoPreviewSize}
              generationMode={generationMode}
            />
            {/* Single mode: Print CTA inline. Batch mode: advance to step 4 */}
            {generationMode === "single" ? (
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Your label is ready — print or export from the preview panel →
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-border hover:border-primary/50 font-semibold text-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl font-semibold text-sm transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print Label
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => advanceToStep(4)}
                  className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                >
                  Next: Print Options
                </button>
              </div>
            )}
          </div>
        </AccordionStep>

        {/* STEP 4: PRINT OPTIONS — batch only */}
        {generationMode === "batch" && (
          <AccordionStep
            stepNum={4}
            title="Print Options"
            subtitle={`${printConfig.labelWidth}mm × ${printConfig.labelHeight}mm · ${printConfig.labelsPerRow}/row`}
            isActive={activeStep === 4}
            isCompleted={completedSteps.includes(4)}
            onClick={() => setActiveStep(4)}
          >
            <div className="pt-2">
              <PrintSettings
                config={printConfig}
                onChange={setPrintConfig}
                onManualResize={() => setAutoPreviewSize(false)}
              />
            </div>
          </AccordionStep>
        )}
      </div>

      {/* RIGHT COLUMN: STICKY PREVIEW */}
      <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 lg:sticky lg:top-24 pb-16">
        <LabelPreviewPanel
          uploadedData={uploadedData}
          printRef={printRef}
          showStyleSettings={false}
          setShowStyleSettings={() => { }}
          renderSingleLabel={renderSingleLabel}
          handlePrint={handlePrint}
          handleDownloadPdf={handlePrint}
          labelConfig={labelConfig}
          setLabelConfig={setLabelConfig}
          styleConfig={styleConfig}
          setStyleConfig={setStyleConfig}
          printConfig={printConfig}
          generationMode={generationMode}
          forceSinglePreview={generationMode === "batch" && activeStep < 4}
        />
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ensure your printer is connected and loaded with label paper.
                <br />
                <span className="text-primary font-semibold">Click Print in the preview panel above.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

