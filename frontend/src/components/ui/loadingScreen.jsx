import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0f1117] flex flex-col items-center justify-center text-white">
      <motion.div
        className="w-16 h-16 rounded-full border-t-4 border-b-4 border-purple-500"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
      <p className="mt-6 text-lg text-gray-300 animate-pulse">
        Finding the best prices across stores…
      </p>
    </div>
  );
}