import { motion } from "framer-motion";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function AnimatedLogo({ size = "md", showTagline = true }: AnimatedLogoProps) {
  const isSm = size === "sm";
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        {/* ANIMERT V-SYMBOL */}
        <div className={`relative ${isSm ? "h-7 w-7" : "h-11 w-11"} flex items-center justify-center`}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-amber-500/30"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`font-black text-amber-500 ${isSm ? "text-3xl" : "text-5xl"} italic tracking-tighter`}
          >
            V
          </motion.div>
        </div>

        {/* TEKST */}
        <h2 className={`${isSm ? "text-xl" : "text-3xl"} font-black text-white italic tracking-tighter uppercase`}>
          ideo<span className="text-amber-500">Mill</span>
        </h2>
      </div>

      {/* TAGLINE */}
      {showTagline && !isSm && (
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.3em] mt-1 ml-2 italic">
          The <span className="text-zinc-400 font-black">Non-Stop</span> Viral Engine
        </p>
      )}
    </div>
  );
}
