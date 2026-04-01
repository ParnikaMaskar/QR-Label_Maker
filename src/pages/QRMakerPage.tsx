import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { QRGenerator } from "@/components/QRGenerator";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const QRMakerPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-8 pb-16">
        <section id="qr-maker-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powerful & Easy to Use</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Start Creating{" "}
                <span className="text-gradient">QR Codes</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create professional QR codes for URLs, WiFi networks, contacts, and more. Customize and download instantly.
              </p>
            </motion.div>

            <div className="flex justify-center mb-8">
              <div className="relative w-full">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-xl -z-10" />
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Instant Generation</span>
                    </div>
                  </div>
                  <QRGenerator />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default QRMakerPage;
