"use client";

import Image from "next/image";

export function CuteBackground() {
  return (
    <div className="fixed bottom-8 md:bottom-2 left-0 right-0 z-0 pointer-events-none">
      <div className="relative w-full h-64 md:h-128">
        <Image
          src="/imgs/bg_hobhob.png"
          alt="Cute background decoration"
          fill
          className="object-contain object-bottom opacity-30 dark:opacity-20"
          priority
        />
      </div>
    </div>
  );
}
