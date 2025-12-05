import { motion } from "framer-motion";

function FeatureCard({
  icon,
  title,
  description,
  index = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-8 rounded-2xl bg-card border border-border hover:border-teal-500/50 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-teal-500/5"
    >
      {/* Icon Container */}
      <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors duration-300">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-teal-500/5 transform rotate-45 translate-x-10 -translate-y-10 group-hover:bg-teal-500/10 transition-colors duration-300" />
      </div>
    </motion.div>
  );
}

export { FeatureCard };
