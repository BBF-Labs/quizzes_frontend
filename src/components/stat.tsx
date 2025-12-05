import { motion } from "framer-motion";

function Stat({ 
  number, 
  label, 
  index = 0 
}: { 
  number: string; 
  label: string; 
  index?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="relative inline-block">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-teal-600 dark:text-teal-500 mb-2 group-hover:scale-110 transition-transform duration-300">
          {number}
        </div>
        {/* Decorative underline */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-teal-500/30 rounded-full group-hover:w-full group-hover:bg-teal-500/50 transition-all duration-300" />
      </div>
      <div className="text-muted-foreground mt-3 font-medium">{label}</div>
    </motion.div>
  );
}

export { Stat };
