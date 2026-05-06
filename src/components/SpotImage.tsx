"use client";

import { useState } from "react";
import { cn, getFallbackGradient, getTypeIcon } from "@/lib/utils";

interface SpotImageProps {
  src: string | null;
  alt: string;
  types: string[];
  id: string;
  className?: string;
  sizes?: string;
}

export default function SpotImage({
  src,
  alt,
  types,
  id,
  className,
}: SpotImageProps) {
  const [failed, setFailed] = useState(false);
  const gradient = getFallbackGradient(id);
  const emoji = getTypeIcon(types);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          gradient,
          className
        )}
      >
        <span className="text-4xl drop-shadow-lg">{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
