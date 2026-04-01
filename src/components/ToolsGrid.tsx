import { motion } from "framer-motion";
import { 
  QrCode, 
  Link, 
  Wifi, 
  Contact, 
  Mail, 
  Phone, 
  MessageSquare,
  MapPin,
  Type
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  popular?: boolean;
}

const tools: Tool[] = [
  {
    id: "url",
    name: "URL QR Code",
    description: "Create QR codes for any website link",
    icon: Link,
    gradient: "from-blue-400 to-blue-600",
    popular: false,
  },
  {
    id: "wifi",
    name: "WiFi QR Code",
    description: "Share WiFi credentials instantly",
    icon: Wifi,
    gradient: "from-green-400 to-green-600",
  },
  {
    id: "contact",
    name: "Contact QR Code",
    description: "Save contact info with vCard",
    icon: Contact,
    gradient: "from-orange-400 to-orange-600",
  },
  {
    id: "email",
    name: "Email QR Code",
    description: "Create mailto links instantly",
    icon: Mail,
    gradient: "from-purple-400 to-purple-600",
  },
  {
    id: "phone",
    name: "Phone QR Code",
    description: "Direct phone number QR codes",
    icon: Phone,
    gradient: "from-red-400 to-red-600",
  },
  {
    id: "sms",
    name: "SMS QR Code",
    description: "Pre-filled text messages",
    icon: MessageSquare,
    gradient: "from-pink-400 to-pink-600",
  },
  {
    id: "text",
    name: "Text QR Code",
    description: "Encode plain text messages",
    icon: Type,
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    id: "location",
    name: "Location QR Code",
    description: "Share GPS coordinates",
    icon: MapPin,
    gradient: "from-indigo-400 to-indigo-600",
  },
];

export const ToolsGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">All QR Code Types</h2>
          <p className="section-subtitle">
            Choose from a variety of QR code types for any purpose
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool, index) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/qr-maker?type=${tool.id}`)}
              className="card-modern p-6 text-left group hover:shadow-lg transition-all duration-300 h-full flex flex-col"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>

              {/* Popular Badge */}
              {tool.popular && (
                <span className="badge-primary text-xs mb-2 w-fit">
                  Popular
                </span>
              )}

              {/* Content */}
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground flex-grow">
                {tool.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/qr-maker')}
            className="btn-secondary group"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Start Creating QR Codes
          </button>
        </motion.div>
      </div>
    </section>
  );
};

