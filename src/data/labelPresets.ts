/**
 * Predefined Aesthetic Label Presets
 * Includes border styles, colors, and complete label configurations
 */

export type LayoutType =
  | "horizontal"
  | "vertical"
  | "qr-only"
  | "address"
  | "product-tag"
  | "2x4-label";

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
  qrCodeType: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  logo: string;
  logoSize: number;
  qrColor: string;
  qrBgColor: string;
  heading: string;
  borderWidth: number;
  borderColor: string;
  borderStyle: string;
  qrShape: string;
  qrStyle: string;
  autoSize: boolean;
  labelWidth?: number;
  labelHeight?: number;
}

export type LabelPreset = {
  id: string;
  name: string;
  category: LabelPresetCategory;
  description: string;
  previewColors: {
    border: string;
    background: string;
    accent: string;
  };
  config: Partial<LabelConfig>;
};

export type LabelPresetCategory = 
  | "minimal"
  | "classic"
  | "modern"
  | "bold"
  | "elegant"
  | "playful";

const defaultFields: LabelField[] = [
  { id: "1", name: "Item", value: "Product Name", fontSize: 14, bold: true },
  { id: "2", name: "Details", value: "Description here", fontSize: 10, bold: false },
  { id: "3", name: "Code", value: "SKU-12345", fontSize: 9, bold: false },
];

const createLabelConfig = (
  layout: LayoutType,
  borderWidth: number,
  borderColor: string,
  qrColor: string,
  heading: string,
  borderStyle: string = "solid"
): Partial<LabelConfig> => ({
  layout,
  fields: defaultFields,
  borderWidth,
  borderColor,
  qrColor,
  heading,
  borderStyle,
  qrBgColor: "#ffffff",
  autoSize: true,
});

export const LABEL_PRESETS: LabelPreset[] = [
  // ========== MINIMAL CATEGORY ==========
  {
    id: "minimal-thin",
    name: "Minimal Thin",
    category: "minimal",
    description: "Clean thin border with monochrome design",
    previewColors: {
      border: "#e5e7eb",
      background: "#ffffff",
      accent: "#374151",
    },
    config: createLabelConfig("horizontal", 1, "#e5e7eb", "#374151", "LABEL"),
  },
  {
    id: "minimal-clean",
    name: "Clean No Border",
    category: "minimal",
    description: "No border, just clean content",
    previewColors: {
      border: "#f3f4f6",
      background: "#ffffff",
      accent: "#1f2937",
    },
    config: {
      ...createLabelConfig("horizontal", 0, "#ffffff", "#1f2937", ""),
      fields: [
        { id: "1", name: "", value: "Product Name", fontSize: 16, bold: true },
        { id: "2", name: "", value: "Scan for info", fontSize: 10, bold: false },
      ],
    },
  },
  {
    id: "minimal-dot",
    name: "Minimal Dotted",
    category: "minimal",
    description: "Dotted border for subtle distinction",
    previewColors: {
      border: "#9ca3af",
      background: "#ffffff",
      accent: "#4b5563",
    },
    config: {
      ...createLabelConfig("vertical", 1, "#9ca3af", "#4b5563", ""),
      borderStyle: "dotted",
    },
  },

  // ========== CLASSIC CATEGORY ==========
  {
    id: "classic-black",
    name: "Classic Black",
    category: "classic",
    description: "Traditional black border frame",
    previewColors: {
      border: "#000000",
      background: "#ffffff",
      accent: "#000000",
    },
    config: createLabelConfig("horizontal", 2, "#000000", "#000000", "LABEL"),
  },
  {
    id: "classic-rounded",
    name: "Classic Rounded",
    category: "classic",
    description: "Rounded corners with elegant styling",
    previewColors: {
      border: "#1f2937",
      background: "#ffffff",
      accent: "#1f2937",
    },
    config: {
      ...createLabelConfig("qr-only", 2, "#1f2937", "#1f2937", ""),
      borderStyle: "rounded",
    },
  },
  {
    id: "classic-double",
    name: "Classic Double",
    category: "classic",
    description: "Double border line for formal look",
    previewColors: {
      border: "#374151",
      background: "#fffbeb",
      accent: "#374151",
    },
    config: {
      ...createLabelConfig("vertical", 3, "#374151", "#374151", "OFFICIAL"),
      borderStyle: "double",
    },
  },

  // ========== MODERN CATEGORY ==========
  {
    id: "modern-blue",
    name: "Modern Blue",
    category: "modern",
    description: "Sleek blue accent border",
    previewColors: {
      border: "#3b82f6",
      background: "#eff6ff",
      accent: "#2563eb",
    },
    config: {
      ...createLabelConfig("horizontal", 2, "#3b82f6", "#2563eb", "PRODUCT"),
      fields: [
        { id: "1", name: "ITEM", value: "Product Name", fontSize: 13, bold: true },
        { id: "2", name: "ID", value: "12345", fontSize: 10, bold: false },
      ],
    },
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    category: "modern",
    description: "Vibrant gradient border effect",
    previewColors: {
      border: "#8b5cf6",
      background: "#faf5ff",
      accent: "#7c3aed",
    },
    config: {
      ...createLabelConfig("product-tag", 2, "#8b5cf6", "#7c3aed", "PREMIUM"),
      fields: [
        { id: "1", name: "★", value: "Premium Item", fontSize: 14, bold: true },
        { id: "2", name: "$$$", value: "99.99", fontSize: 12, bold: false },
        { id: "3", name: "↗", value: "Scan for details", fontSize: 9, bold: false },
      ],
    },
  },
  {
    id: "modern-tech",
    name: "Tech Style",
    category: "modern",
    description: "Digital tech aesthetic",
    previewColors: {
      border: "#06b6d4",
      background: "#ecfeff",
      accent: "#0891b2",
    },
    config: {
      ...createLabelConfig("qr-only", 2, "#06b6d4", "#0891b2", "TECH"),
      fields: [
        { id: "1", name: "SN:", value: "SERIAL123", fontSize: 11, bold: true },
        { id: "2", name: "Model:", value: "XYZ-100", fontSize: 9, bold: false },
      ],
    },
  },

  // ========== BOLD CATEGORY ==========
  {
    id: "bold-red",
    name: "Bold Red",
    category: "bold",
    description: "Eye-catching red border",
    previewColors: {
      border: "#dc2626",
      background: "#fef2f2",
      accent: "#b91c1c",
    },
    config: createLabelConfig("horizontal", 3, "#dc2626", "#b91c1c", "IMPORTANT"),
  },
  {
    id: "bold-orange",
    name: "Bold Orange",
    category: "bold",
    description: "High visibility orange frame",
    previewColors: {
      border: "#ea580c",
      background: "#fff7ed",
      accent: "#c2410c",
    },
    config: createLabelConfig("product-tag", 3, "#ea580c", "#c2410c", "SALE"),
  },
  {
    id: "bold-green",
    name: "Bold Green",
    category: "bold",
    description: "Strong green accent border",
    previewColors: {
      border: "#16a34a",
      background: "#f0fdf4",
      accent: "#15803d",
    },
    config: createLabelConfig("vertical", 3, "#16a34a", "#15803d", "APPROVED"),
  },

  // ========== ELEGANT CATEGORY ==========
  {
    id: "elegant-gold",
    name: "Elegant Gold",
    category: "elegant",
    description: "Luxurious gold border accent",
    previewColors: {
      border: "#b45309",
      background: "#fffbeb",
      accent: "#92400e",
    },
    config: {
      ...createLabelConfig("horizontal", 2, "#b45309", "#92400e", "VIP"),
      borderStyle: "double",
      fields: [
        { id: "1", name: "◆", value: "Premium Product", fontSize: 14, bold: true },
        { id: "2", name: "Exclusive", value: "Limited Edition", fontSize: 10, bold: false },
      ],
    },
  },
  {
    id: "elegant-silver",
    name: "Elegant Silver",
    category: "elegant",
    description: "Sophisticated silver frame",
    previewColors: {
      border: "#6b7280",
      background: "#f9fafb",
      accent: "#4b5563",
    },
    config: {
      ...createLabelConfig("vertical", 2, "#6b7280", "#4b5563", "COLLECTION"),
      borderStyle: "rounded",
    },
  },
  {
    id: "elegant-navy",
    name: "Elegant Navy",
    category: "elegant",
    description: "Professional navy blue border",
    previewColors: {
      border: "#1e3a8a",
      background: "#f0f9ff",
      accent: "#1e40af",
    },
    config: createLabelConfig("horizontal", 2, "#1e3a8a", "#1e40af", "OFFICIAL"),
  },

  // ========== PLAYFUL CATEGORY ==========
  {
    id: "playful-rainbow",
    name: "Playful Rainbow",
    category: "playful",
    description: "Fun multi-colored border",
    previewColors: {
      border: "#ec4899",
      background: "#fdf2f8",
      accent: "#f472b6",
    },
    config: {
      ...createLabelConfig("product-tag", 3, "#ec4899", "#db2777", "FUN!"),
      fields: [
        { id: "1", name: "✿", value: "Amazing Item", fontSize: 14, bold: true },
        { id: "2", name: "☀", value: "Awesome!", fontSize: 11, bold: false },
      ],
    },
  },
  {
    id: "playful-star",
    name: "Playful Stars",
    category: "playful",
    description: "Decorative star-themed label",
    previewColors: {
      border: "#f59e0b",
      background: "#fffbeb",
      accent: "#d97706",
    },
    config: {
      ...createLabelConfig("horizontal", 2, "#f59e0b", "#d97706", "★ STAR ★"),
      fields: [
        { id: "1", name: "★", value: "Best Seller", fontSize: 13, bold: true },
        { id: "2", name: "☀", value: "Top Rated", fontSize: 10, bold: false },
      ],
    },
  },
  {
    id: "playful-circle",
    name: "Playful Circles",
    category: "playful",
    description: "Fun circle pattern border",
    previewColors: {
      border: "#22c55e",
      background: "#f0fdf4",
      accent: "#16a34a",
    },
    config: {
      ...createLabelConfig("vertical", 2, "#22c55e", "#16a34a", "NEW!"),
      borderStyle: "rounded",
      fields: [
        { id: "1", name: "●", value: "Fresh Item", fontSize: 13, bold: true },
        { id: "2", name: "→", value: "Check it out!", fontSize: 10, bold: false },
      ],
    },
  },
];

// Label Categories for filtering
export const LABEL_PRESET_CATEGORIES: { id: LabelPresetCategory; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🗂️" },
  { id: "minimal", label: "Minimal", icon: "⬜" },
  { id: "classic", label: "Classic", icon: "📋" },
  { id: "modern", label: "Modern", icon: "⚡" },
  { id: "bold", label: "Bold", icon: "💪" },
  { id: "elegant", label: "Elegant", icon: "✨" },
  { id: "playful", label: "Playful", icon: "🎨" },
];

// Helper function to filter presets by category
export const getLabelPresetsByCategory = (category: LabelPresetCategory | "all"): LabelPreset[] => {
  if (category === "all") return LABEL_PRESETS;
  return LABEL_PRESETS.filter((preset) => preset.category === category);
};

// Helper function to get preset by ID
export const getLabelPresetById = (id: string): LabelPreset | undefined => {
  return LABEL_PRESETS.find((preset) => preset.id === id);
};

// Type for category filter
export type LabelCategoryFilter = LabelPresetCategory | "all";

