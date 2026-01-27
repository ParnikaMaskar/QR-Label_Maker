import { useState, useCallback } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { TooltipProvider } from "@/components/ui/tooltip";
import InputPanel from "./InputPanel";
import QRPreview from "./QRPreview";
import QRStylePanel from "./QRStylePanel";

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

export const QRGenerator = () => {
  // UI mode - simple or style
  const [uiMode, setUiMode] = useState<"simple" | "style">("simple");

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
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

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

  // Logo handling
  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be under 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setStyleConfig((prev) => ({
          ...prev,
          logo: { ...prev.logo, src: base64 },
        }));
        toast.success("Logo uploaded!");
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    []
  );

  const clearLogo = () => {
    setStyleConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, src: "" },
    }));
    toast.success("Logo removed");
  };

  // Get QR value
  const getQRValue = (rowData?: Record<string, string>): string => {
    if (rowData && selectedColumn && rowData[selectedColumn]) {
      return rowData[selectedColumn];
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
    qrValue.length > 0 &&
    !qrValue.startsWith("WIFI:T:WPA;S:;") &&
    !qrValue.includes("FN:\nTEL:\nEMAIL:") &&
    qrValue !== "mailto:?subject=&body=";

  // Download single QR
  const downloadQR = () => {
    const qr = (window as any).__qrInstance;
    if (!qr) {
      toast.error("QR not ready yet");
      return;
    }
    qr.download({ name: `qrcode-${qrType}`, extension: "png" });
    toast.success("QR downloaded!");
  };

  // Build gradient
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

  // Download batch
  const downloadAllQRs = async () => {
    if (uploadedData.length === 0 || !selectedColumn) {
      toast.error("Please upload data and select a column first");
      return;
    }

    const toastId = toast.loading(`Generating ${uploadedData.length} QR codes...`);

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

  // Copy to clipboard
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

  // Handle data loaded
  const handleDataLoaded = (data: Record<string, string>[]) => {
    setUploadedData(data);
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      setSelectedColumn(cols[0] || "");
      setActiveTab("batch");
    }
    toast.success(`Loaded ${data.length} rows`);
  };

  const clearUploadedData = () => {
    setUploadedData([]);
    setSelectedColumn("");
    setActiveTab("single");
    toast.success("Upload cleared");
  };

  // Render
  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        {uiMode === "style" ? (
          // Style mode - show style panel
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <QRPreview
                hasValue={hasValue}
                qrValue={qrValue}
                uploadedData={uploadedData}
                selectedColumn={selectedColumn}
                copied={copied}
                downloadQR={downloadQR}
                copyToClipboard={copyToClipboard}
                styleConfig={styleConfig}
                uiMode={uiMode}
                setUiMode={setUiMode}
                setStyleConfig={setStyleConfig}
              />
            </div>
            <div>
              <QRStylePanel
                styleConfig={styleConfig}
                setStyleConfig={setStyleConfig}
              />
            </div>
          </div>
        ) : (
          // Simple mode - input and preview
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <InputPanel
                qrType={qrType}
                setQrType={setQrType}
                textValue={textValue}
                setTextValue={setTextValue}
                wifiData={wifiData}
                setWifiData={setWifiData}
                contactData={contactData}
                setContactData={setContactData}
                emailData={emailData}
                setEmailData={setEmailData}
                qrValue={qrValue}
                uploadedData={uploadedData}
                selectedColumn={selectedColumn}
                setSelectedColumn={setSelectedColumn}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                availableColumns={availableColumns}
                handleDataLoaded={handleDataLoaded}
                clearUploadedData={clearUploadedData}
                downloadAllQRs={downloadAllQRs}
                handleLogoUpload={handleLogoUpload}
                clearLogo={clearLogo}
                hasLogo={!!styleConfig.logo.src}
              />
            </div>
            <div>
              <QRPreview
                hasValue={hasValue}
                qrValue={qrValue}
                uploadedData={uploadedData}
                selectedColumn={selectedColumn}
                copied={copied}
                downloadQR={downloadQR}
                copyToClipboard={copyToClipboard}
                styleConfig={styleConfig}
                uiMode={uiMode}
                setUiMode={setUiMode}
                setStyleConfig={setStyleConfig}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

