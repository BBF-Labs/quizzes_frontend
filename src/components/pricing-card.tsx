import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Check, Sparkles } from "lucide-react";

function PricingCard({
  title,
  price,
  period = "",
  description,
  features,
  buttonText,
  highlighted = false,
  index = 0,
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`
        relative rounded-2xl p-8 transition-all duration-300
        ${
          highlighted
            ? "bg-teal-500 text-white border-2 border-teal-500 scale-105 shadow-2xl shadow-teal-500/25"
            : "bg-card border border-border shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg hover:border-teal-500/50"
        }
      `}
    >
      {/* Popular Badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-teal-600 shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Most Popular
        </div>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${highlighted ? "text-white" : "text-foreground"}`}>
          {title}
        </h3>
        <p className={`text-sm ${highlighted ? "text-white/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>
      
      {/* Price */}
      <div className="mb-8 pb-8 border-b border-current/10">
        <span className={`text-5xl font-bold ${highlighted ? "text-white" : "text-teal-600 dark:text-teal-500"}`}>
          {price}
        </span>
        {period && (
          <span className={`text-base ml-1 ${highlighted ? "text-white/70" : "text-muted-foreground"}`}>
            {period}
          </span>
        )}
      </div>
      
      {/* Features List */}
      <ul className="space-y-4 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${
                highlighted ? "bg-white/20" : "bg-teal-500/10"
              }`}
            >
              <Check
                className={`w-3.5 h-3.5 ${
                  highlighted ? "text-white" : "text-teal-600 dark:text-teal-500"
                }`}
              />
            </div>
            <span className={`text-sm ${highlighted ? "text-white/90" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA Button */}
      <Button
        variant={highlighted ? "secondary" : "outline"}
        className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
          highlighted 
            ? "bg-white text-teal-600 hover:bg-white/90" 
            : "border-2 border-teal-500 text-teal-600 dark:text-teal-500 hover:bg-teal-500 hover:text-white"
        }`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}

export { PricingCard };
