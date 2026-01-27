import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Are QR codes generated here free to use?",
    answer: "Yes! All QR codes generated on our platform are completely free for both personal and commercial use. You can download them in high-resolution PNG format without any watermarks or restrictions.",
  },
  {
    question: "Can I customize the colors of my QR code?",
    answer: "Absolutely! You can customize the foreground and background colors, add gradients, change the corner styles, and even add your own logo or image in the center of the QR code.",
  },
  {
    question: "What types of QR codes can I create?",
    answer: "We support multiple QR code types including URLs/links, WiFi network codes, vCard contact information, email addresses, phone numbers, text messages, and social media profiles.",
  },
  {
    question: "How many QR codes can I generate at once?",
    answer: "With our batch generation feature, you can upload a CSV file and generate hundreds or even thousands of QR codes at once. Perfect for inventory management, event tickets, or product labels.",
  },
  {
    question: "Can I create printable labels with QR codes?",
    answer: "Yes! Our Label Maker tool allows you to create professional labels with QR codes. You can customize the layout, add text fields, choose from various label sizes, and print directly from your browser.",
  },
  {
    question: "Do the QR codes expire?",
    answer: "No, the QR codes themselves don't expire. However, if you're directing users to a URL, the lifespan of that QR code depends on how long the linked website or page remains active.",
  },
  {
    question: "Are the generated QR codes scannable?",
    answer: "Yes, we use industry-standard QR generation with high error correction levels to ensure your codes are easily scannable. You can even customize the error correction level for more redundant data storage.",
  },
  {
    question: "Can I track how many people scan my QR code?",
    answer: "Basic QR codes don't include tracking. However, you can use our URL QR codes with UTM parameters or integrate with analytics tools to track scans. For advanced tracking, consider using a URL shortener service with analytics.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq-section" className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Find answers to common questions about our QR code generator
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card-modern overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-foreground">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-muted-foreground text-sm">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              // Placeholder for contact support functionality
              console.log("Contact Support clicked");
            }}
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
};

