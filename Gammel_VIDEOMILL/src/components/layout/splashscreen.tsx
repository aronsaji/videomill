import { AnimatedLogo } from "./animatedlogo";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* HER SETTER VI STØRRELSEN TIL XL */}
            <AnimatedLogo size="xl" showTagline={true} />
            
            {/* Valgfri progress bar under logoen */}
            <motion.div 
              className="mt-12 h-1 w-64 bg-zinc-900 rounded-full overflow-hidden mx-auto"
            >
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
