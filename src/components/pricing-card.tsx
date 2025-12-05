import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

function PricingCard({
  title,
  price,
  period = "",
  description,
  features,
  buttonText,
  highlighted = false,
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        pricing-card rounded-xl p-8 transition-all duration-300
        backdrop-blur-xl border border-transparent
        ${
          highlighted
            ? "bg-primary/10 shadow-xl shadow-secondary/10"
            : "bg-background shadow-lg"
        }
        hover:shadow-2xl hover:shadow-secondary/10
      `}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium bg-teal-500 text-white">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mb-8">
        <span className="text-5xl font-bold text-teal-500">{price}</span>
        <span className="text-muted-foreground ml-2">{period}</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div
              className={`mr-3 rounded-full p-1 ${
                highlighted ? "bg-secondary/10" : "bg-primary/10"
              }`}
            >
              <Check
                className={`w-4 h-4 ${
                  highlighted ? "text-secondary" : "text-primary"
                }`}
              />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? "gradient" : "outline"}
        className="w-full h-12 text-base font-medium"
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}

export { PricingCard };
