"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function FloatingOrbs() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </>
    );
  }

  return (
    <>
      <motion.div
        className="orb orb-1"
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb orb-2"
        animate={{ x: [0, -20, 25, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </>
  );
}
