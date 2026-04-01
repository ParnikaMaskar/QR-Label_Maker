import { useState, useCallback } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Zap, FileSpreadsheet, Link, Wifi, User, Mail, Download, Sparkles } from "lucide-react";
import QRPreview from "./QRPreview";
import QRStylePanel from "./QRStylePanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "./FileUploader";

type QRType = "text" | "wifi" | "contact" | "email";

interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

interface ContactData {
  name: string;
  phone: string;
  email: string;
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

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
            <div className="p-5 pt-0 border-t border-border/50">
              {children}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export const QRGenerator = () => {
  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Generation Mode
  const [activeTab, setActiveTab] = useState<"single" | "batch" | null>(null);

  // QR Data
  const [qrType, setQrType] = useState<QRType>("text");
  const [textValue, setTextValue] = useState("");

  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: "",
    password: "",
    encryption: "WPA",
  });

  const [contactData, setContactData] = useState<ContactData>({
    name: "",
    phone: "",
    email: "",
  });

  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    subject: "",
    body: "",
  });

  const [copied, setCopied] = useState(false);

  // Batch Data
  const [uploadedData, setUploadedData] = useState<Record<string, string>[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  // Style Config
  const [styleConfig, setStyleConfig] = useState({
    dots: {
      type: "square",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,
      gradientColor1: "#000000",
      gradientColor2: "#3b82f6",
    },
    cornersSquare: {
      type: "square",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,
      gradientColor1: "#000000",
      gradientColor2: "#3b82f6",
    },
    cornersDot: {
      type: "dot",
      color: "#000000",
      gradientEnabled: false,
      gradientType: "linear" as const,
      gradientColor1: "#000000",
      gradientColor2: "#3b82f6",
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
      size: 0.35,
      margin: 6,
      hideBackgroundDots: true,
    },
  });

  // Derived values
  const availableColumns = uploadedData.length > 0 ? Object.keys(uploadedData[0]) : [];

  // Helper mapping for single modes
  const qrTypeOptions = [
    { type: "text" as QRType, label: "URL / Text", icon: Link, color: "from-blue-500 to-cyan-500" },
    { type: "wifi" as QRType, label: "WiFi", icon: Wifi, color: "from-purple-500 to-pink-500" },
    { type: "contact" as QRType, label: "Contact", icon: User, color: "from-orange-500 to-amber-500" },
    { type: "email" as QRType, label: "Email", icon: Mail, color: "from-green-500 to-emerald-500" },
  ];

  // Actions
  const advanceToStep = (step: number) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStep])));
    setActiveStep(step);
  };

  const getQRValue = (rowData?: Record<string, string>): string => {
    if (activeTab === "batch" && rowData && selectedColumn && rowData[selectedColumn]) {
      return rowData[selectedColumn];
    }

    if (activeTab === "batch") {
      return ""; // Default preview for batch when no row selected or just starting
    }

    switch (qrType) {
      case "text":
        return textValue;
      case "wifi":
        return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
      case "contact":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.name}\nTEL:${contactData.phone}\nEMAIL:${contactData.email}\nEND:VCARD`;
      case "email":
        return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      default:
        return "";
    }
  };

  const qrValue = getQRValue();

  const hasValue =
    (activeTab === "single" && qrValue.length > 0 &&
      !qrValue.startsWith("WIFI:T:WPA;S:;") &&
      !qrValue.includes("FN:\nTEL:\nEMAIL:") &&
      qrValue !== "mailto:?subject=&body=") || (activeTab === "batch" && uploadedData.length > 0);

  const downloadQR = () => {
    const qr = (window as any).__qrInstance;
    if (!qr) return toast.error("QR not ready yet");
    qr.download({ name: `qrcode-${qrType}`, extension: "png" });
    toast.success("QR downloaded!");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDataLoaded = (data: Record<string, string>[]) => {
    setUploadedData(data);
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      setSelectedColumn(cols[0] || "");
    }
    toast.success(`Loaded ${data.length} rows`);
    advanceToStep(3); // Auto advance to styling
  };

  const downloadAllQRs = async () => {
    if (uploadedData.length === 0 || !selectedColumn) {
      toast.error("Please upload data and select a column first");
      return;
    }
    const toastId = toast.loading(`Generating ${uploadedData.length} QR codes...`);

    const buildGradient = (cfg: any) => {
      if (!cfg?.gradientEnabled) return undefined;
      return {
        type: cfg.gradientType || "linear",
        rotation: 0,
        colorStops: [
          { offset: 0, color: cfg.gradientColor1 },
          { offset: 1, color: cfg.gradientColor2 },
        ],
      };
    };

    try {
      const zip = new JSZip();

      for (let i = 0; i < uploadedData.length; i++) {
        const value = uploadedData[i][selectedColumn];
        if (!value) continue;

        const qr = new QRCodeStyling({
          width: 512,
          height: 512,
          type: "canvas",
          data: value,
          image: styleConfig.logo.src || undefined,
          dotsOptions: {
            type: styleConfig.dots.type as any,
            color: styleConfig.dots.color,
            gradient: buildGradient(styleConfig.dots),
          },
          cornersSquareOptions: {
            type: styleConfig.cornersSquare.type as any,
            color: styleConfig.cornersSquare.color,
            gradient: buildGradient(styleConfig.cornersSquare),
          },
          cornersDotOptions: {
            type: styleConfig.cornersDot.type as any,
            color: styleConfig.cornersDot.color,
            gradient: buildGradient(styleConfig.cornersDot),
          },
          backgroundOptions: {
            color: styleConfig.background.color,
            gradient: buildGradient(styleConfig.background),
          },
          imageOptions: {
            imageSize: styleConfig.logo.size,
            margin: styleConfig.logo.margin,
            hideBackgroundDots: styleConfig.logo.hideBackgroundDots,
            crossOrigin: "anonymous",
          },
        });

        const blob = await qr.getRawData("png");
        zip.file(`qr-${i + 1}.png`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `qr-codes-${Date.now()}.zip`;
      link.click();

      toast.success("ZIP downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ZIP", { id: toastId });
    }
  };

  // Step Summaries
  const getStep1Summary = () => {
    if (!activeTab) return "Choose format";
    if (activeTab === "batch") return "Batch (CSV/Excel)";
    return `Single QR: ${qrTypeOptions.find(t => t.type === qrType)?.label}`;
  };

  const getStep2Summary = () => {
    if (!activeTab) return "Awaiting mode selection";
    if (activeTab === "batch") {
      return uploadedData.length > 0 ? `${uploadedData.length} records loaded` : "Required";
    }
    return hasValue ? "Content entered" : "Required";
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row gap-8 items-start relative max-w-7xl mx-auto">

        {/* Left Side - Stepper Forms */}
        <div className="flex-1 w-full space-y-4 pb-8 lg:pb-0">

          {/* STEP 1: CHOOSE TYPE */}
          <AccordionStep
            stepNum={1}
            title="Choose Format"
            subtitle={getStep1Summary()}
            isActive={activeStep === 1}
            isCompleted={completedSteps.includes(1) || !!activeTab}
            onClick={() => setActiveStep(1)}
          >
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveTab("single");
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${activeTab === "single"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-border hover:border-primary/50 bg-white"
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTab === 'single' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground">Individual QR</h4>
                    <p className="text-xs text-muted-foreground mt-1">Create a single, customized QR code</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("batch");
                    advanceToStep(2);
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 ${activeTab === "batch"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-border hover:border-primary/50 bg-white"
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTab === 'batch' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground">Batch Generation</h4>
                    <p className="text-xs text-muted-foreground mt-1">Create multiple QRs from a file</p>
                  </div>
                </button>
              </div>

              {/* Sub-selection for Single QR */}
              {activeTab === "single" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-4 border-t border-border/50"
                >
                  <Label className="label-clean mb-3 block">What do you want to share?</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {qrTypeOptions.map((option, index) => {
                      const Icon = option.icon;
                      const isActive = qrType === option.type;
                      return (
                        <motion.button
                          key={option.type}
                          onClick={() => {
                            setQrType(option.type);
                            advanceToStep(2);
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${isActive
                              ? "text-white"
                              : "text-muted-foreground hover:bg-secondary border border-border bg-white"
                            }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeType"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <div className="relative z-10">
                            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                          </div>
                          <span className={`relative z-10 text-xs font-semibold ${isActive ? 'text-white' : 'text-foreground'}`}>
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </AccordionStep>

          {/* STEP 2: ENTER CONTENT */}
          <AccordionStep
            stepNum={2}
            title={activeTab === "batch" ? "Upload Data" : "Enter Content"}
            subtitle={getStep2Summary()}
            isActive={activeStep === 2}
            isCompleted={completedSteps.includes(2) || hasValue}
            onClick={() => setActiveStep(2)}
          >
            <div className="pt-2 space-y-4">
              {activeTab === "single" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <Label className="label-clean text-base">
                        {qrType === "text" && "Enter URL or Text"}
                        {qrType === "wifi" && "WiFi Network Details"}
                        {qrType === "contact" && "Contact Information"}
                        {qrType === "email" && "Email Details"}
                      </Label>
                    </div>
                    <p className="helper-text text-sm">
                      {qrType === "text" && "Your QR code will contain this text or link"}
                      {qrType === "wifi" && "People can scan to connect to your WiFi"}
                      {qrType === "contact" && "Save contact info directly to phone"}
                      {qrType === "email" && "Quick compose email with pre-filled fields"}
                    </p>
                  </div>

                  {qrType === "text" && (
                    <Input
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="https://example.com"
                      className="input-float text-base"
                    />
                  )}

                  {qrType === "wifi" && (
                    <div className="space-y-4 max-w-sm">
                      <Input
                        value={wifiData.ssid}
                        onChange={(e) => setWifiData((p) => ({ ...p, ssid: e.target.value }))}
                        placeholder="Network name (SSID)"
                        className="input-float"
                      />
                      <Input
                        value={wifiData.password}
                        onChange={(e) => setWifiData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Password"
                        type="password"
                        className="input-float"
                      />
                      <Select
                        value={wifiData.encryption}
                        onValueChange={(v: WifiData["encryption"]) => setWifiData((p) => ({ ...p, encryption: v }))}
                      >
                        <SelectTrigger className="input-float">
                          <SelectValue placeholder="Security type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {qrType === "contact" && (
                    <div className="space-y-4 max-w-sm">
                      <Input
                        value={contactData.name}
                        onChange={(e) => setContactData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Full name"
                        className="input-float"
                      />
                      <Input
                        value={contactData.phone}
                        onChange={(e) => setContactData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="Phone number"
                        type="tel"
                        className="input-float"
                      />
                      <Input
                        value={contactData.email}
                        onChange={(e) => setContactData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email address"
                        type="email"
                        className="input-float"
                      />
                    </div>
                  )}

                  {qrType === "email" && (
                    <div className="space-y-4 max-w-sm">
                      <Input
                        value={emailData.to}
                        onChange={(e) => setEmailData((p) => ({ ...p, to: e.target.value }))}
                        placeholder="To email"
                        type="email"
                        className="input-float"
                      />
                      <Input
                        value={emailData.subject}
                        onChange={(e) => setEmailData((p) => ({ ...p, subject: e.target.value }))}
                        placeholder="Subject"
                        className="input-float"
                      />
                      <Input
                        value={emailData.body}
                        onChange={(e) => setEmailData((p) => ({ ...p, body: e.target.value }))}
                        placeholder="Message body"
                        className="input-float"
                      />
                    </div>
                  )}

                  {/* Auto-advance helper button for visual flow */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => advanceToStep(3)}
                      disabled={!hasValue}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${hasValue ? 'bg-primary text-white hover:bg-primary/90' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
                    >
                      Next: Design
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "batch" && (
                <div className="space-y-4">
                  {uploadedData.length === 0 ? (
                    <FileUploader onDataLoaded={handleDataLoaded} />
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{uploadedData.length} records loaded</p>
                            <p className="text-xs text-muted-foreground">Select column to encode</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setUploadedData([]);
                            setSelectedColumn("");
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="max-w-sm">
                        <Label className="label-clean">Target Column</Label>
                        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                          <SelectTrigger className="input-float mt-1.5">
                            <SelectValue placeholder="Choose a column" />
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

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => advanceToStep(3)}
                          disabled={!selectedColumn}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${selectedColumn ? 'bg-primary text-white hover:bg-primary/90' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
                        >
                          Next: Design
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {!activeTab && (
                <div className="py-8 text-center text-muted-foreground">
                  Please select a format in Step 1 first.
                </div>
              )}
            </div>
          </AccordionStep>

          {/* STEP 3: DESIGN */}
          <AccordionStep
            stepNum={3}
            title="Design & Style"
            subtitle="Customize colors and shapes"
            isActive={activeStep === 3}
            isCompleted={false}
            onClick={() => {
              if (activeTab && hasValue) setActiveStep(3);
            }}
          >
            {activeTab && hasValue ? (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-6">
                  Design changes are instantly reflected in the live preview panel.
                </p>
                {/* Embedded Style Panel stripped of outer card borders */}
                <div className="-mx-5">
                  {/* We pass the internal component and it will look native. Wait, QRStylePanel has its own card wrapper. Let's wrap it in a div that resets borders, or just use it. */}
                  <style>{`
                     .qr-style-wrapper .card-clean {
                       border: none;
                       box-shadow: none;
                     }
                   `}</style>
                  <div className="qr-style-wrapper">
                    <QRStylePanel styleConfig={styleConfig} setStyleConfig={setStyleConfig} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Please enter your content first.
              </div>
            )}
          </AccordionStep>

        </div>

        {/* Right Side - Sticky Preview Wrapper */}
        <div className="w-full lg:w-[450px] flex-shrink-0 relative">
          <div className="lg:sticky lg:top-24 pb-12">
            <h3 className="section-title text-2xl mb-4 hidden lg:block">Live Preview</h3>
            <QRPreview
              hasValue={hasValue}
              qrValue={qrValue}
              uploadedData={uploadedData}
              selectedColumn={selectedColumn}
              copied={copied}
              downloadQR={downloadQR}
              copyToClipboard={copyToClipboard}
              styleConfig={styleConfig}
              uiMode="style" // Removed the toggle but providing prop just to satisfy types if needed
              setUiMode={() => { }}
              setStyleConfig={setStyleConfig}
            />

            {/* Batch download button placed cleanly under the preview when in batch mode */}
            {activeTab === "batch" && uploadedData.length > 0 && selectedColumn && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <button
                  onClick={downloadAllQRs}
                  className="w-full btn-glow flex items-center justify-center gap-2 py-4"
                >
                  <Download className="w-5 h-5" />
                  Download {uploadedData.length} QR ZIP
                </button>
              </motion.div>
            )}

            {/* Download button for single mode */}
            {activeTab === "single" && hasValue && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <button
                  onClick={downloadQR}
                  className="w-full btn-glow flex items-center justify-center gap-2 py-4"
                >
                  <Download className="w-5 h-5" />
                  Download QR Code
                </button>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
};

export default QRGenerator;
