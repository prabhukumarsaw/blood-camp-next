"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

/**
 * A Next.js Image wrapper that gracefully falls back to a placeholder
 * when the main image fails to load.
 */
export function ImageFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.png",
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
