"use client";
import React, { useState, useEffect, useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ContainerImageFlip({
  images = [],
  interval = 3000,
  className,
  imgClassName,
  animationDuration = 700
}) {
  const id = useId();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const imageRef = React.useRef(null);

  const updateWidthForImage = () => {
    if (imageRef.current) {
      const imageWidth = imageRef.current.scrollWidth + 30;
      setWidth(imageWidth);
    }
  };

  useEffect(() => {
    updateWidthForImage();
  }, [currentIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(intervalId);
  }, [images, interval]);

  return (
    <motion.div
  className={cn("inline-block", className)}
  style={{
    minWidth: "120px", // or 150px based on your widest image
    display: "flex",
    justifyContent: "center",
  }}
  key={images[currentIndex]}
>
      <motion.div
        transition={{
          duration: animationDuration / 1000,
          ease: "easeInOut",
        }}
        className="inline-block"
        ref={imageRef}
        layoutId={`image-${currentIndex}-${id}`}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt=""
          className={cn("h-16 object-contain", imgClassName)}
          initial={{
            opacity: 0,
            filter: "blur(10px)"
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)"
          }}
          transition={{
            duration: 0.5
          }}
        />
      </motion.div>
    </motion.div>
  );
}
