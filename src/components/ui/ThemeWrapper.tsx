import { motion } from "framer-motion";
import { AnimatedBackground } from "./AnimatedBackground";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  return (
    <AnimatedBackground>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-4 md:p-6 lg:p-8"
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </motion.div>
    </AnimatedBackground>
  );
};