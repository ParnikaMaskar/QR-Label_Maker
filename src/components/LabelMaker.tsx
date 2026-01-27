import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { PrintConfig, defaultPrintConfig } from "./PrintSettings";
import StyledQR, { generateStyledQRDataUrl, StyleConfig } from "./StyledQR";
import LabelInputPanel from "./LabelInputPanel";
import LabelPreviewPanel from "./LabelPreviewPanel";
import LabelStylePanel from "./LabelStylePanel";
import { runAiMagicLayout, getLogoDimensions, getLogoRatio, validateContentFit, AIConfigOutput } from "@/lib/aiLayoutEngine";
import { Sparkles } from "lucide-react";

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

interface LabelField {
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

export const LabelMaker = () => {
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
    "qr" | "layout" | "fields" | "print"
  >("qr");

  // AI loading state for "sassy" animation
  const [isAiThinking, setIsAiThinking] = useState(false);

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

    const labelWidthPx = printConfig.labelWidth * 3.78;
    const labelHeightPx = printConfig.labelHeight * 3.78;
    const maxQrSize = Math.min(labelWidthPx, labelHeightPx) * 0.7;

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
          lineHeight: 1.3,
          color: labelConfig.textColor || 'inherit',
        }}
      >
        <strong>{field.name}:</strong>{" "}
        {getFieldValue(field, rowData)}
      </p>
    );

    let content: React.ReactNode = null;

    // Get layout class based on AI decision
    const layoutClass = labelConfig.layout === 'horizontal' 
      ? 'flex items-center gap-4' 
      : labelConfig.layout === 'vertical'
      ? 'flex flex-col items-center gap-2 text-center'
      : labelConfig.layout === 'qr-only'
      ? 'flex justify-center'
      : 'flex items-center gap-4';

    switch (labelConfig.layout) {
      case "horizontal": {
        // Get AI-derived width percentages for visual balance
        const leftWidth = labelConfig.leftWidthPercent || 40;
        const rightWidth = labelConfig.rightWidthPercent || 60;
        
        content = (
          <div className={layoutClass}>
            {/* QR/Logo Section - Left */}
            <div 
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: `${leftWidth}%` }}
            >
              {qr}
            </div>
            {/* Text Section - Right */}
            <div 
              className="flex flex-col gap-1 overflow-hidden"
              style={{ width: `${rightWidth}%` }}
            >
              {labelConfig.fields.map((field, idx) => renderField(field, idx))}
            </div>
          </div>
        );
        break;
      }

      case "vertical":
        content = (
          <div className={layoutClass}>
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
          <div className={layoutClass}>
            {qr}
            <div className="flex flex-col gap-0.5">
              {labelConfig.fields.map((field, idx) => renderField(field, idx))}
            </div>
          </div>
        );
        break;

      case "product-tag":
        content = (
          <div className={layoutClass}>
            {labelConfig.fields[0] &&
              renderField(labelConfig.fields[0], 0)}
            {qr}
            <div className="flex flex-col gap-0.5">
              {labelConfig.fields.slice(1).map((field, idx) => renderField(field, idx + 1))}
            </div>
          </div>
        );
        break;
    }
    
    const pxPerMm = 4.5;

    const manualWidthPx =
      !labelConfig.autoSize && labelConfig.labelWidth
        ? labelConfig.labelWidth * pxPerMm
        : undefined;

    const manualHeightPx =
      !labelConfig.autoSize && labelConfig.labelHeight
        ? labelConfig.labelHeight * pxPerMm
        : undefined;


    return (
      <div
        className="inline-flex flex-col justify-center rounded-lg"
        style={{
          border: `${labelConfig.borderWidth}px solid ${labelConfig.borderColor}`,
          padding: `${padding}px`,
          width: manualWidthPx ? `${manualWidthPx}px` : "fit-content",
          height: manualHeightPx ? `${manualHeightPx}px` : "fit-content",
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

    const labelWidthMm = printConfig.labelWidth || 50;
    const labelHeightMm = printConfig.labelHeight || 30;
    
    const labelWidthPx = labelWidthMm * 3.78;
    const labelHeightPx = labelHeightMm * 3.78;
    const maxQrSize = Math.min(labelWidthPx, labelHeightPx) * 0.7;

    const qrSize = labelConfig.autoSize
      ? Math.min(maxQrSize, 100)
      : (labelConfig.qrSize || 80);
    
    const baseFontSize = labelConfig.baseFontSize || 14;
    const padding = labelConfig.padding || 12;
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
                line-height: 1.3;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: ${textColor};
              ">
                <strong>${field.name}:</strong> ${value}
              </p>
            `;
          });

          const imgTag = `<img src="${qrDataUrl}" style="width:${qrSize}px;height:${qrSize}px;object-fit:contain;" alt="QR Code" />`;

          let contentHtml = "";
          
          // Get layout class based on AI decision
          const layoutStyles = {
            horizontal: 'display:flex;gap:4mm;align-items:center;',
            vertical: 'display:flex;flex-direction:column;align-items:center;gap:2mm;text-align:center;',
            'qr-only': 'display:flex;justify-content:center;',
            address: 'display:flex;gap:4mm;align-items:center;',
            '2x4-label': 'display:flex;gap:4mm;align-items:center;',
            'product-tag': 'display:flex;flex-direction:column;align-items:center;gap:2mm;',
          };
          
          const layoutStyle = layoutStyles[labelConfig.layout as keyof typeof layoutStyles] || layoutStyles.horizontal;

          switch (labelConfig.layout) {
            case "horizontal": {
              // Get AI-derived width percentages for print layout
              const leftWidth = labelConfig.leftWidthPercent || 40;
              const rightWidth = labelConfig.rightWidthPercent || 60;
              const leftWidthStyle = `width:${leftWidth}%;display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
              const rightWidthStyle = `width:${rightWidth}%;overflow:hidden;`;
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
              contentHtml = `<div style="${layoutStyle}">${imgTag}<div style="overflow:hidden;">${fieldHtmls.join("")}</div></div>`;
              break;

            case "product-tag":
              contentHtml = `<div style="${layoutStyle}">${fieldHtmls[0] || ""}${imgTag}<div style="overflow:hidden;">${fieldHtmls.slice(1).join("")}</div></div>`;
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
                background: white;
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
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
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
                grid-template-columns: repeat(${printConfig.labelsPerRow}, ${labelWidthMm}mm);
                gap: ${printConfig.gapVertical}mm ${printConfig.gapHorizontal}mm;
                padding: 10mm;
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
    <div className="flex h-screen gap-4 p-4">
      <AnimatePresence>
        {!showStyleSettings && (
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
            handleDataLoaded={handleDataLoaded}
            handleLogoUpload={handleLogoUpload}
            clearLogo={clearLogo}
            clearData={clearData}
            applyAiLayout={applyAiLayout}
            isAiThinking={isAiThinking}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col gap-4">
        <LabelPreviewPanel
          uploadedData={uploadedData}
          printRef={printRef}
          showStyleSettings={showStyleSettings}
          setShowStyleSettings={setShowStyleSettings}
          renderSingleLabel={renderSingleLabel}
          handlePrint={handlePrint}
          labelConfig={labelConfig}
          setLabelConfig={setLabelConfig}
          styleConfig={styleConfig}
          setStyleConfig={setStyleConfig}
        />
        
        {/* Help Text Quote - Just above footer area */}
        <div className="mt-auto p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ensure your printer is connected and loaded with label paper. 
                Click <span className="text-primary font-semibold">Style</span> to adjust label design. 
                <br />
                <span className="text-purple-500 font-semibold">Try the AI Magic Layout button for auto-optimization!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <LabelStylePanel
          show={showStyleSettings}
          onClose={() => setShowStyleSettings(false)}
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
        />
      </AnimatePresence>
    </div>
  );
};

