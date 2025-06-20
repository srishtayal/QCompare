import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const facts = [
  "We compare real-time prices across Instamart, Zepto & Blinkit — instantly.",
  "Save ₹50–₹200 every order by simply comparing. QCompare makes it effortless.",
  "Q-commerce delivers in under 10 minutes — but prices vary wildly.",
  "Zepto, Blinkit, and Instamart often have exclusive discounts.",
  "Found cheaper on another platform? QCompare will tell you — no bias.",
  "Don’t waste time checking apps — compare once, order smart.",
  "Prices for the same product can vary by 30% across platforms!",
  "Why pay more? QCompare ensures you get the lowest effective price.",
  "Try group ordering to save more and reduce your carbon footprint.",
  "Smart shopping = better savings. Let QCompare handle the work.",
];

// Shuffle utility
function shuffleFacts(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LoadingScreen() {
  const [shuffledFacts, setShuffledFacts] = useState(() => shuffleFacts(facts));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % shuffledFacts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [shuffledFacts]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1117] text-white flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-16 h-16 rounded-full border-t-4 border-b-4 border-yellow-500"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <div className="mt-8 h-20 flex items-center justify-center text-center max-w-xl">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-lg sm:text-xl text-gray-300"
          >
            {shuffledFacts[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}