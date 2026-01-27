import { motion } from "framer-motion";
import { 
  Palette, 
  Download, 
  QrCode, 
  Shield, 
  Zap, 
  Globe,
  Layers,
  Users
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Palette,
    title: "Custom Design",
    description: "Personalize your QR codes with custom colors, gradients, and corner styles to match your brand.",
  },
  {
    icon: QrCode,
    title: "Logo Integration",
    description: "Add your company logo or any image to the center of your QR code for brand recognition.",
  },
  {
    icon: Download,
    title: "High Resolution",
    description: "Download your QR codes in high-resolution PNG format, perfect for print and digital use.",
  },
  {
    icon: Layers,
    title: "Batch Generation",
    description: "Generate hundreds of QR codes at once by uploading a CSV file with your data.",
  },
  {
    icon: Shield,
    title: "No Expiration",
    description: "Your QR codes don't expire and work forever. Create once, use anywhere, anytime.",
  },
  {
    icon: Zap,
    title: "Instant Download",
    description: "Generate and download your QR code in seconds. No waiting, no watermarks.",
  },
  {
    icon: Globe,
    title: "Global Standards",
    description: "Our QR codes follow international standards and work with any QR scanner worldwide.",
  },
  {
    icon: Users,
    title: "Free Forever",
    description: "All features are completely free for both personal and commercial use. No hidden costs.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features-section" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to create professional QR codes and labels
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

