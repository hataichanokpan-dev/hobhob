"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// List of available background images
const BACKGROUND_IMAGES = [
  "/imgs/bg_hobhob.png",
  "/imgs/bg_hobhob_read.png",
  "/imgs/bg_hobhob_code.png",
  "/imgs/bg_hobhob_meditate.png",
];

export function CuteBackground() {
  const [randomImage, setRandomImage] = useState<string>("");

  useEffect(() => {
    // Pick a random image on mount
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setRandomImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  if (!randomImage) return null;

  return (
    <div className="fixed bottom-10 md:bottom-2 left-0 right-0 z-0 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full h-48 md:h-128"
      >
        <Image
          src={randomImage}
          alt="Cute background decoration"
          fill
          className="object-contain object-bottom opacity-30 dark:opacity-20"
          priority
        />
      </motion.div>
    </div>
  );
}
