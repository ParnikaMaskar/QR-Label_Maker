/**
 * Predefined Aesthetic QR Code Presets
 * Inspired by me-qr.com designs
 */

export type GradientConfig = {
  gradientEnabled: boolean;
  gradientType: "linear" | "radial";
  gradientColor1: string;
  gradientColor2: string;
};

export type StyleSection = {
  type: string;
  color: string;
} & GradientConfig;

export type StyleConfig = {
  dots: StyleSection;
  cornersSquare: StyleSection;
  cornersDot: StyleSection;
  background: Omit<StyleSection, "type">;
  logo: {
    src: string;
    size: number;
    margin: number;
    hideBackgroundDots: boolean;
  };
};

export type Preset = {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
  };
  config: StyleConfig;
};

export type PresetCategory = 
  | "minimal"
  | "gradient"
  | "dark"
  | "colorful"
  | "elegant"
  | "nature"
  | "modern";

const createStyleConfig = (
  dots: Partial<StyleSection>,
  cornersSquare: Partial<StyleSection>,
  cornersDot: Partial<StyleSection>,
  backgroundColor: string
): StyleConfig => ({
  dots: {
    type: "square",
    color: "#000000",
    gradientEnabled: false,
    gradientType: "linear",
    gradientColor1: "#000000",
    gradientColor2: "#000000",
    ...dots,
  },
  cornersSquare: {
    type: "square",
    color: "#000000",
    gradientEnabled: false,
    gradientType: "linear",
    gradientColor1: "#000000",
    gradientColor2: "#000000",
    ...cornersSquare,
  },
  cornersDot: {
    type: "dot",
    color: "#000000",
    gradientEnabled: false,
    gradientType: "linear",
    gradientColor1: "#000000",
    gradientColor2: "#000000",
    ...cornersDot,
  },
  background: {
    color: backgroundColor,
    gradientEnabled: false,
    gradientType: "linear",
    gradientColor1: backgroundColor,
    gradientColor2: backgroundColor,
  },
  logo: {
    src: "",
    size: 0.35,
    margin: 6,
    hideBackgroundDots: true,
  },
});

export const QR_PRESETS: Preset[] = [
  // ========== MINIMAL CATEGORY ==========
  {
    id: "minimal-classic",
    name: "Classic Black",
    category: "minimal",
    description: "Clean and timeless black QR code",
    previewColors: {
      primary: "#000000",
      secondary: "#000000",
      background: "#ffffff",
    },
    config: createStyleConfig(
      { type: "square", color: "#000000" },
      { type: "square", color: "#000000" },
      { type: "dot", color: "#000000" },
      "#ffffff"
    ),
  },
  {
    id: "minimal-rounded",
    name: "Soft Rounded",
    category: "minimal",
    description: "Gentle rounded corners for a friendly look",
    previewColors: {
      primary: "#1a1a1a",
      secondary: "#1a1a1a",
      background: "#ffffff",
    },
    config: createStyleConfig(
      { type: "rounded", color: "#1a1a1a" },
      { type: "rounded", color: "#1a1a1a" },
      { type: "dot", color: "#1a1a1a" },
      "#ffffff"
    ),
  },
  {
    id: "minimal-dots",
    name: "Modern Dots",
    category: "minimal",
    description: "Contemporary dot-style pattern",
    previewColors: {
      primary: "#2d3748",
      secondary: "#2d3748",
      background: "#f8f9fa",
    },
    config: createStyleConfig(
      { type: "dots", color: "#2d3748" },
      { type: "dot", color: "#2d3748" },
      { type: "dot", color: "#2d3748" },
      "#f8f9fa"
    ),
  },
  {
    id: "minimal-classy",
    name: "Classy Square",
    category: "minimal",
    description: "Sophisticated classic pattern",
    previewColors: {
      primary: "#374151",
      secondary: "#374151",
      background: "#ffffff",
    },
    config: createStyleConfig(
      { type: "classy", color: "#374151" },
      { type: "square", color: "#374151" },
      { type: "dot", color: "#374151" },
      "#ffffff"
    ),
  },

  // ========== GRADIENT CATEGORY ==========
  {
    id: "gradient-ocean",
    name: "Ocean Breeze",
    category: "gradient",
    description: "Cool blue gradients like the sea",
    previewColors: {
      primary: "#3b82f6",
      secondary: "#06b6d4",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "rounded",
        color: "#3b82f6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#3b82f6",
        gradientColor2: "#06b6d4",
      },
      {
        type: "rounded",
        color: "#06b6d4",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#3b82f6",
        gradientColor2: "#06b6d4",
      },
      { type: "dot", color: "#06b6d4" },
      "#ffffff"
    ),
  },
  {
    id: "gradient-sunset",
    name: "Sunset Glow",
    category: "gradient",
    description: "Warm orange to pink gradient",
    previewColors: {
      primary: "#f97316",
      secondary: "#ec4899",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "extra-rounded",
        color: "#f97316",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f97316",
        gradientColor2: "#ec4899",
      },
      {
        type: "extra-rounded",
        color: "#ec4899",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f97316",
        gradientColor2: "#ec4899",
      },
      { type: "dot", color: "#ec4899" },
      "#ffffff"
    ),
  },
  {
    id: "gradient-aurora",
    name: "Aurora",
    category: "gradient",
    description: "Purple to blue mystical gradient",
    previewColors: {
      primary: "#8b5cf6",
      secondary: "#3b82f6",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "classy-rounded",
        color: "#8b5cf6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#8b5cf6",
        gradientColor2: "#3b82f6",
      },
      {
        type: "rounded",
        color: "#3b82f6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#8b5cf6",
        gradientColor2: "#3b82f6",
      },
      { type: "dot", color: "#3b82f6" },
      "#ffffff"
    ),
  },
  {
    id: "gradient-neon",
    name: "Neon Flow",
    category: "gradient",
    description: "Electric pink to cyan gradient",
    previewColors: {
      primary: "#f472b6",
      secondary: "#22d3ee",
      background: "#0f172a",
    },
    config: createStyleConfig(
      {
        type: "dots",
        color: "#f472b6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f472b6",
        gradientColor2: "#22d3ee",
      },
      {
        type: "rounded",
        color: "#22d3ee",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f472b6",
        gradientColor2: "#22d3ee",
      },
      { type: "dot", color: "#22d3ee" },
      "#0f172a"
    ),
  },
  {
    id: "gradient-forest",
    name: "Forest Mist",
    category: "gradient",
    description: "Fresh green natural tones",
    previewColors: {
      primary: "#22c55e",
      secondary: "#14b8a6",
      background: "#f0fdf4",
    },
    config: createStyleConfig(
      {
        type: "rounded",
        color: "#22c55e",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#22c55e",
        gradientColor2: "#14b8a6",
      },
      {
        type: "rounded",
        color: "#14b8a6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#22c55e",
        gradientColor2: "#14b8a6",
      },
      { type: "dot", color: "#14b8a6" },
      "#f0fdf4"
    ),
  },
  {
    id: "gradient-royal",
    name: "Royal Purple",
    category: "gradient",
    description: "Regal purple gradient for elegance",
    previewColors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "classy",
        color: "#7c3aed",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#7c3aed",
        gradientColor2: "#a855f7",
      },
      {
        type: "extra-rounded",
        color: "#a855f7",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#7c3aed",
        gradientColor2: "#a855f7",
      },
      { type: "dot", color: "#a855f7" },
      "#ffffff"
    ),
  },

  // ========== DARK CATEGORY ==========
  {
    id: "dark-midnight",
    name: "Midnight",
    category: "dark",
    description: "White on deep navy darkness",
    previewColors: {
      primary: "#e2e8f0",
      secondary: "#f1f5f9",
      background: "#0f172a",
    },
    config: createStyleConfig(
      { type: "square", color: "#e2e8f0" },
      { type: "square", color: "#f1f5f9" },
      { type: "dot", color: "#e2e8f0" },
      "#0f172a"
    ),
  },
  {
    id: "dark-neon",
    name: "Cyberpunk",
    category: "dark",
    description: "Bright cyan on pure black",
    previewColors: {
      primary: "#22d3ee",
      secondary: "#22d3ee",
      background: "#000000",
    },
    config: createStyleConfig(
      {
        type: "extra-rounded",
        color: "#22d3ee",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#22d3ee",
        gradientColor2: "#06b6d4",
      },
      {
        type: "extra-rounded",
        color: "#22d3ee",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#22d3ee",
        gradientColor2: "#06b6d4",
      },
      { type: "dot", color: "#22d3ee" },
      "#000000"
    ),
  },
  {
    id: "dark-elegant",
    name: "Noir",
    category: "dark",
    description: "Sophisticated gold on black",
    previewColors: {
      primary: "#fbbf24",
      secondary: "#f59e0b",
      background: "#171717",
    },
    config: createStyleConfig(
      {
        type: "classy-rounded",
        color: "#fbbf24",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#fbbf24",
        gradientColor2: "#f59e0b",
      },
      {
        type: "rounded",
        color: "#f59e0b",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#fbbf24",
        gradientColor2: "#f59e0b",
      },
      { type: "dot", color: "#f59e0b" },
      "#171717"
    ),
  },
  {
    id: "dark-sunset",
    name: "Night Aurora",
    category: "dark",
    description: "Gradient glow in darkness",
    previewColors: {
      primary: "#f97316",
      secondary: "#8b5cf6",
      background: "#020617",
    },
    config: createStyleConfig(
      {
        type: "dots",
        color: "#f97316",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f97316",
        gradientColor2: "#8b5cf6",
      },
      {
        type: "rounded",
        color: "#8b5cf6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#f97316",
        gradientColor2: "#8b5cf6",
      },
      { type: "dot", color: "#8b5cf6" },
      "#020617"
    ),
  },

  // ========== COLORFUL CATEGORY ==========
  {
    id: "colorful-rainbow",
    name: "Prismatic",
    category: "colorful",
    description: "Vibrant multi-color spectrum",
    previewColors: {
      primary: "#ef4444",
      secondary: "#3b82f6",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "classy-rounded",
        color: "#ef4444",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#ef4444",
        gradientColor2: "#3b82f6",
      },
      {
        type: "extra-rounded",
        color: "#22c55e",
        gradientEnabled: false,
        gradientType: "linear",
        gradientColor1: "#22c55e",
        gradientColor2: "#22c55e",
      },
      { type: "dot", color: "#f59e0b" },
      "#ffffff"
    ),
  },
  {
    id: "colorful-pop",
    name: "Pop Art",
    category: "colorful",
    description: "Bold and playful colors",
    previewColors: {
      primary: "#ec4899",
      secondary: "#8b5cf6",
      background: "#fefce8",
    },
    config: createStyleConfig(
      {
        type: "extra-rounded",
        color: "#ec4899",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#ec4899",
        gradientColor2: "#f97316",
      },
      {
        type: "rounded",
        color: "#8b5cf6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#8b5cf6",
        gradientColor2: "#ec4899",
      },
      { type: "dot", color: "#f59e0b" },
      "#fefce8"
    ),
  },
  {
    id: "colorful-confetti",
    name: "Confetti",
    category: "colorful",
    description: "Fun celebration colors",
    previewColors: {
      primary: "#22c55e",
      secondary: "#f59e0b",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "dots",
        color: "#22c55e",
        gradientEnabled: false,
        gradientType: "linear",
        gradientColor1: "#22c55e",
        gradientColor2: "#22c55e",
      },
      {
        type: "dot",
        color: "#f59e0b",
        gradientEnabled: false,
        gradientType: "linear",
        gradientColor1: "#f59e0b",
        gradientColor2: "#f59e0b",
      },
      { type: "dot", color: "#ef4444" },
      "#ffffff"
    ),
  },

  // ========== ELEGANT CATEGORY ==========
  {
    id: "elegant-gold",
    name: "Gold Premium",
    category: "elegant",
    description: "Luxurious gold on white",
    previewColors: {
      primary: "#b45309",
      secondary: "#b45309",
      background: "#fffbeb",
    },
    config: createStyleConfig(
      {
        type: "classy",
        color: "#b45309",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#b45309",
        gradientColor2: "#d97706",
      },
      {
        type: "square",
        color: "#d97706",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#b45309",
        gradientColor2: "#d97706",
      },
      { type: "dot", color: "#d97706" },
      "#fffbeb"
    ),
  },
  {
    id: "elegant-silver",
    name: "Silver Sophistication",
    category: "elegant",
    description: "Sleek silver metallic look",
    previewColors: {
      primary: "#6b7280",
      secondary: "#9ca3af",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "classy-rounded",
        color: "#6b7280",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#6b7280",
        gradientColor2: "#9ca3af",
      },
      {
        type: "rounded",
        color: "#9ca3af",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#6b7280",
        gradientColor2: "#9ca3af",
      },
      { type: "dot", color: "#9ca3af" },
      "#ffffff"
    ),
  },
  {
    id: "elegant-navy",
    name: "Executive",
    category: "elegant",
    description: "Professional navy blue",
    previewColors: {
      primary: "#1e3a8a",
      secondary: "#1e40af",
      background: "#f8fafc",
    },
    config: createStyleConfig(
      {
        type: "classy",
        color: "#1e3a8a",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#1e3a8a",
        gradientColor2: "#1e40af",
      },
      {
        type: "square",
        color: "#1e40af",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#1e3a8a",
        gradientColor2: "#1e40af",
      },
      { type: "dot", color: "#1e40af" },
      "#f8fafc"
    ),
  },

  // ========== NATURE CATEGORY ==========
  {
    id: "nature-forest",
    name: "Deep Forest",
    category: "nature",
    description: "Rich green natural tones",
    previewColors: {
      primary: "#166534",
      secondary: "#15803d",
      background: "#f0fdf4",
    },
    config: createStyleConfig(
      {
        type: "rounded",
        color: "#166534",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#166534",
        gradientColor2: "#15803d",
      },
      {
        type: "rounded",
        color: "#15803d",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#166534",
        gradientColor2: "#15803d",
      },
      { type: "dot", color: "#15803d" },
      "#f0fdf4"
    ),
  },
  {
    id: "nature-ocean",
    name: "Deep Sea",
    category: "nature",
    description: "Cool ocean blue tones",
    previewColors: {
      primary: "#0c4a6e",
      secondary: "#0369a1",
      background: "#f0f9ff",
    },
    config: createStyleConfig(
      {
        type: "classy-rounded",
        color: "#0c4a6e",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#0c4a6e",
        gradientColor2: "#0369a1",
      },
      {
        type: "rounded",
        color: "#0369a1",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#0c4a6e",
        gradientColor2: "#0369a1",
      },
      { type: "dot", color: "#0369a1" },
      "#f0f9ff"
    ),
  },
  {
    id: "nature-autumn",
    name: "Autumn Leaves",
    category: "nature",
    description: "Warm brown and orange tones",
    previewColors: {
      primary: "#92400e",
      secondary: "#ea580c",
      background: "#fffbeb",
    },
    config: createStyleConfig(
      {
        type: "extra-rounded",
        color: "#92400e",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#92400e",
        gradientColor2: "#ea580c",
      },
      {
        type: "extra-rounded",
        color: "#ea580c",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#92400e",
        gradientColor2: "#ea580c",
      },
      { type: "dot", color: "#ea580c" },
      "#fffbeb"
    ),
  },

  // ========== MODERN CATEGORY ==========
  {
    id: "modern-tech",
    name: "Tech Blue",
    category: "modern",
    description: "Sleek modern tech aesthetic",
    previewColors: {
      primary: "#0ea5e9",
      secondary: "#0284c7",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "square",
        color: "#0ea5e9",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#0ea5e9",
        gradientColor2: "#0284c7",
      },
      {
        type: "square",
        color: "#0284c7",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#0ea5e9",
        gradientColor2: "#0284c7",
      },
      { type: "dot", color: "#0284c7" },
      "#ffffff"
    ),
  },
  {
    id: "modern-startup",
    name: "Startup",
    category: "modern",
    description: "Fresh startup gradient",
    previewColors: {
      primary: "#8b5cf6",
      secondary: "#06b6d4",
      background: "#ffffff",
    },
    config: createStyleConfig(
      {
        type: "rounded",
        color: "#8b5cf6",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#8b5cf6",
        gradientColor2: "#06b6d4",
      },
      {
        type: "rounded",
        color: "#06b6d4",
        gradientEnabled: true,
        gradientType: "linear",
        gradientColor1: "#8b5cf6",
        gradientColor2: "#06b6d4",
      },
      { type: "dot", color: "#06b6d4" },
      "#ffffff"
    ),
  },
  {
    id: "modern-minimal",
    name: "Clean Modern",
    category: "modern",
    description: "Clean and modern monochrome",
    previewColors: {
      primary: "#64748b",
      secondary: "#475569",
      background: "#ffffff",
    },
    config: createStyleConfig(
      { type: "square", color: "#64748b" },
      { type: "rounded", color: "#475569" },
      { type: "dot", color: "#64748b" },
      "#ffffff"
    ),
  },
];

// Preset Categories for filtering
export const PRESET_CATEGORIES: { id: PresetCategory; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🗂️" },
  { id: "minimal", label: "Minimal", icon: "⬜" },
  { id: "gradient", label: "Gradient", icon: "🌈" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "colorful", label: "Colorful", icon: "🎨" },
  { id: "elegant", label: "Elegant", icon: "✨" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "modern", label: "Modern", icon: "⚡" },
];

// Helper function to filter presets by category
export const getPresetsByCategory = (category: PresetCategory | "all"): Preset[] => {
  if (category === "all") return QR_PRESETS;
  return QR_PRESETS.filter((preset) => preset.category === category);
};

// Type for category filter
export type CategoryFilter = PresetCategory | "all";

// Helper function to get preset by ID
export const getPresetById = (id: string): Preset | undefined => {
  return QR_PRESETS.find((preset) => preset.id === id);
};

