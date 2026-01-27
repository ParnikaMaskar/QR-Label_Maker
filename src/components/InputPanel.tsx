import { useState } from "react";
import {
  Link,
  Wifi,
  User,
  Mail,
  Upload,
  FileSpreadsheet,
  Download,
  Sparkles,
  Zap,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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

type Props = {
  qrType: QRType;
  setQrType: (v: QRType) => void;
  textValue: string;
  setTextValue: (v: string) => void;
  wifiData: WifiData;
  setWifiData: (v: WifiData) => void;
  contactData: ContactData;
  setContactData: (v: ContactData) => void;
  emailData: EmailData;
  setEmailData: (v: EmailData) => void;
  qrValue: string;
  uploadedData: Record<string, string>[];
  selectedColumn: string;
  setSelectedColumn: (v: string) => void;
  activeTab: "single" | "batch";
  setActiveTab: (v: "single" | "batch") => void;
  availableColumns: string[];
  handleDataLoaded: (d: Record<string, string>[]) => void;
  clearUploadedData: () => void;
  downloadAllQRs: () => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearLogo: () => void;
  hasLogo: boolean;
};

const qrTypeOptions: { type: QRType; label: string; icon: LucideIcon; color: string }[] = [
  { type: "text", label: "URL / Text", icon: Link, color: "from-blue-500 to-cyan-500" },
  { type: "wifi", label: "WiFi", icon: Wifi, color: "from-purple-500 to-pink-500" },
  { type: "contact", label: "Contact", icon: User, color: "from-orange-500 to-amber-500" },
  { type: "email", label: "Email", icon: Mail, color: "from-green-500 to-emerald-500" },
];

export default function InputPanel({
  qrType,
  setQrType,
  textValue,
  setTextValue,
  wifiData,
  setWifiData,
  contactData,
  setContactData,
  emailData,
  setEmailData,
  qrValue,
  uploadedData,
  selectedColumn,
  setSelectedColumn,
  activeTab,
  setActiveTab,
  availableColumns,
  handleDataLoaded,
  clearUploadedData,
  downloadAllQRs,
  handleLogoUpload,
  clearLogo,
  hasLogo,
}: Props) {
  const handleWifiChange = (field: keyof WifiData, value: string) => {
    setWifiData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: keyof ContactData, value: string) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: keyof EmailData, value: string) => {
    setEmailData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Mode Toggle - Glass Effect */}
      <div className="glass-card p-1.5 rounded-xl">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === "single"
                ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            Single QR
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === "batch"
                ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Batch
          </button>
        </div>
      </div>

      {activeTab === "single" ? (
        <>
          {/* QR Type Selection - Animated Cards */}
          <div className="card-premium p-1.5">
            <div className="grid grid-cols-4 gap-1">
              {qrTypeOptions.map((option, index) => {
                const Icon = option.icon;
                const isActive = qrType === option.type;
                
                return (
                  <motion.button
                    key={option.type}
                    onClick={() => setQrType(option.type)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeType"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    </div>
                    <span className={`relative z-10 text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content Input - Glass Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-hover rounded-2xl p-6 space-y-4"
          >
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
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Input
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="https://example.com"
                  className="input-float text-base"
                />
              </motion.div>
            )}

            {qrType === "wifi" && (
              <div className="space-y-4">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={wifiData.ssid}
                    onChange={(e) => handleWifiChange("ssid", e.target.value)}
                    placeholder="Network name (SSID)"
                    className="input-float"
                  />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={wifiData.password}
                    onChange={(e) => handleWifiChange("password", e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="input-float"
                  />
                </motion.div>
                <Select
                  value={wifiData.encryption}
                  onValueChange={(v: WifiData["encryption"]) =>
                    setWifiData((prev) => ({ ...prev, encryption: v }))
                  }
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
              <div className="space-y-4">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={contactData.name}
                    onChange={(e) => handleContactChange("name", e.target.value)}
                    placeholder="Full name"
                    className="input-float"
                  />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={contactData.phone}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    className="input-float"
                  />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={contactData.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    placeholder="Email address"
                    type="email"
                    className="input-float"
                  />
                </motion.div>
              </div>
            )}

            {qrType === "email" && (
              <div className="space-y-4">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={emailData.to}
                    onChange={(e) => handleEmailChange("to", e.target.value)}
                    placeholder="To email"
                    type="email"
                    className="input-float"
                  />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={emailData.subject}
                    onChange={(e) => handleEmailChange("subject", e.target.value)}
                    placeholder="Subject"
                    className="input-float"
                  />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    value={emailData.body}
                    onChange={(e) => handleEmailChange("body", e.target.value)}
                    placeholder="Message body"
                    className="input-float"
                  />
                </motion.div>
              </div>
            )}

            {qrValue && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2 flex items-center gap-2"
              >
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(qrValue.length / 5, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {qrValue.length} chars
                </span>
              </motion.div>
            )}
          </motion.div>
        </>
      ) : (
        /* Batch Mode */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-hover rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="label-clean text-base">Upload Data File</Label>
          </div>
          <p className="helper-text text-sm">
            Upload a CSV or Excel file to generate multiple QR codes at once
          </p>

          {uploadedData.length === 0 ? (
            <FileUploader onDataLoaded={handleDataLoaded} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{uploadedData.length} rows loaded</p>
                    <p className="text-xs text-muted-foreground">
                      {availableColumns.length} columns available
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearUploadedData}
                  className="px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  Clear
                </motion.button>
              </div>

              <div>
                <Label className="label-clean">Select Column</Label>
                <p className="helper-text">Which column contains the data for QR codes?</p>
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadAllQRs}
                className="w-full btn-glow flex items-center justify-center gap-2 py-3"
              >
                <Download className="w-5 h-5" />
                Download {uploadedData.length} QR Codes
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Logo Upload - Premium Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-premium rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-primary" />
          <Label className="label-clean text-base">Add Logo (Optional)</Label>
        </div>
        <p className="helper-text text-sm">Your logo will appear in the center of the QR code</p>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative overflow-hidden"
          >
            {hasLogo ? (
              <div className="space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 flex items-center justify-center"
                >
                  <img
                    src={hasLogo ? "data:image/png;base64,placeholder" : ""}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </motion.div>
                <p className="text-sm text-muted-foreground">Click to change logo</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>
            )}
            
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        {hasLogo && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={clearLogo}
            className="w-full py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            Remove Logo
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

