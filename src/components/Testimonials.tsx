import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    content: "This QR code generator is incredibly easy to use. We've created hundreds of codes for our marketing campaigns and the quality is always perfect.",
    avatar: "SJ",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Small Business Owner",
    content: "The label maker feature has saved me hours of work. Creating product labels with QR codes is now a breeze. Highly recommend!",
    avatar: "MC",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Event Coordinator",
    content: "Perfect for creating QR codes for event tickets and menus. The customization options are extensive and the results are professional.",
    avatar: "ER",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "IT Manager",
    content: "We use this tool daily for creating WiFi QR codes for our office. It's reliable, fast, and the batch generation feature is a lifesaver.",
    avatar: "DK",
    rating: 5,
  },
];

export const Testimonials = () => {
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
          <h2 className="section-title mb-4">Loved by Thousands</h2>
          <p className="section-subtitle">
            See what our users have to say about their experience
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-modern p-6 h-full flex flex-col"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4 flex-shrink-0">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm mb-6 line-clamp-4 flex-grow">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 flex-shrink-0 mt-auto pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-sm border border-border/60">
            <span className="text-sm text-muted-foreground">Trusted by over</span>
            <span className="text-xl font-bold text-primary">500,000+ users</span>
            <span className="text-sm text-muted-foreground">worldwide</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

