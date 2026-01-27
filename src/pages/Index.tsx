import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Tags, ChevronRight, Sparkles, ArrowRight, Zap, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRGenerator } from "@/components/QRGenerator";
import { LabelMaker } from "@/components/LabelMaker";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ToolsGrid } from "@/components/ToolsGrid";
import { Testimonials } from "@/components/Testimonials";
import { FAQSection } from "@/components/FAQSection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("qr-generator");
  const [showGenerator, setShowGenerator] = useState(false);

  const scrollToGenerator = () => {
    setShowGenerator(true);
    setTimeout(() => {
      document.getElementById("generator-section")?.scrollIntoView({ 
        behavior: "smooth" 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Glass Effect */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setShowGenerator(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">
                QR<span className="text-gradient">Studio</span>
              </h1>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {[
                { id: "qr-generator", label: "QR Generator", icon: QrCode },
                { id: "label-maker", label: "Label Maker", icon: Tags },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); scrollToGenerator(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id && showGenerator
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                Features
              </motion.button>
              <motion.button
                onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                FAQ
              </motion.button>
            </nav>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:flex items-center gap-3"
            >
              <motion.button
                className="btn-secondary text-sm"
                onClick={() => {
                  console.log("Sign In clicked");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Sign In
              </motion.button>
              <motion.button
                className="btn-glow text-sm"
                onClick={() => { setActiveTab("qr-generator"); scrollToGenerator(); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Landing Sections - Show when not generating */}
        {!showGenerator && (
          <>
            <HeroSection />
            <ToolsGrid />
            <FeaturesSection />
            <Testimonials />
            <FAQSection />
          </>
        )}

        {/* Generator Section */}
        <section 
          id="generator-section" 
          className={`py-16 ${showGenerator ? '' : 'bg-secondary/30'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            {!showGenerator && (
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
                  Choose between our QR Code Generator or Label Maker to create professional codes and labels
                </p>
              </motion.div>
            )}

            {/* Tab Switcher - Premium */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-xl -z-10" />
                
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  className="space-y-8"
                >
                  {/* Tabs List */}
                  <div className="flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2 h-14 p-1.5 bg-white/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl">
                      <TabsTrigger
                        value="qr-generator"
                        onClick={() => { setShowGenerator(true); }}
                        className="flex items-center gap-2 h-11 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                      >
                        <QrCode className="w-5 h-5" />
                        <span>QR Generator</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="label-maker"
                        onClick={() => { setShowGenerator(true); }}
                        className="flex items-center gap-2 h-11 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                      >
                        <Tags className="w-5 h-5" />
                        <span>Label Maker</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* QR Generator Tab */}
                  <TabsContent value="qr-generator" className="mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Tab Header */}
                      <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-3">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Instant Generation</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                          Generate QR Codes
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Create QR codes for URLs, WiFi networks, contacts, and more. Download as PNG instantly.
                        </p>
                      </div>
                      <QRGenerator />
                    </motion.div>
                  </TabsContent>

                  {/* Label Maker Tab */}
                  <TabsContent value="label-maker" className="mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Tab Header */}
                      <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-3">
                          <Layers className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Print-Ready</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                          Create Printable Labels
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Design labels with QR codes and custom text. Perfect for products, inventory, and more.
                        </p>
                      </div>
                      <LabelMaker />
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border/50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">QRStudio</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Free online QR code generator and label maker. Create professional codes and labels instantly.
              </p>
              <div className="flex gap-3">
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </motion.a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">QR Generator</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Label Maker</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Batch Generation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QRStudio. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

