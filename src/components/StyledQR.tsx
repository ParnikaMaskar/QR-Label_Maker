import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

/* ============================================================
   Types
============================================================ */

export type GradientConfig = {
  gradientEnabled: boolean;
  gradientType: "linear" | "radial";
  gradientColor1: string;
  gradientColor2: string;
};

export type StyleSection = {
  type: string;
  color: string;
} & GradientConfig;

export type StyleConfig = {
  dots: StyleSection;
  cornersSquare: StyleSection;
  cornersDot: StyleSection;
  background: Omit<StyleSection, "type">;
  logo: {
    src: string;
    size: number;
    margin: number;
    hideBackgroundDots: boolean;
  };
};

type Props = {
  value: string;
  size?: number;
  styleConfig: StyleConfig;
  onReady?: (instance: any) => void;
};

/* ============================================================
   Shared Gradient Builder
============================================================ */

const buildGradient = (cfg: GradientConfig) => {
  if (!cfg.gradientEnabled) return undefined;

  return {
    type: cfg.gradientType,
    rotation: 0,
    colorStops: [
      { offset: 0, color: cfg.gradientColor1 },
      { offset: 1, color: cfg.gradientColor2 },
    ],
  };
};

/* ============================================================
   ✅ EXPORT: Generate Styled QR as PNG (for Print / PDF)
============================================================ */

export const generateStyledQRDataUrl = async (
  value: string,
  size: number,
  styleConfig: StyleConfig
): Promise<string> => {
  const qr = new QRCodeStyling({
    width: size,
    height: size,
    type: "canvas",
    data: value,

    image: styleConfig.logo.src || undefined,

    dotsOptions: {
      type: styleConfig.dots.type as any,
      color: styleConfig.dots.color,
      gradient: buildGradient(styleConfig.dots),
    },

    cornersSquareOptions: {
      type: styleConfig.cornersSquare.type as any,
      color: styleConfig.cornersSquare.color,
      gradient: buildGradient(styleConfig.cornersSquare),
    },

    cornersDotOptions: {
      type: styleConfig.cornersDot.type as any,
      color: styleConfig.cornersDot.color,
      gradient: buildGradient(styleConfig.cornersDot),
    },

    backgroundOptions: {
      color: styleConfig.background.color,
      gradient: buildGradient(styleConfig.background),
    },

    imageOptions: {
      imageSize: styleConfig.logo.size,
      margin: styleConfig.logo.margin,
      hideBackgroundDots: styleConfig.logo.hideBackgroundDots,
      crossOrigin: "anonymous",
    },
  });
  
const raw = await qr.getRawData("png");

let blob: Blob;

if (raw instanceof Blob) {
  blob = raw;
} else {
  const buffer = raw as Buffer;

  // ✅ Force clean ArrayBuffer slice (no SharedArrayBuffer drama)
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  blob = new Blob([arrayBuffer], { type: "image/png" });
}

return URL.createObjectURL(blob);


};

/* ============================================================
   Default Component (Preview Rendering)
============================================================ */

export default function StyledQR({
  value,
  size = 256,
  styleConfig,
  onReady,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    const options = {
      width: size,
      height: size,
      type: "canvas" as const,
      data: value,

      image: styleConfig.logo.src || undefined,

      dotsOptions: {
        type: styleConfig.dots.type as any,
        color: styleConfig.dots.color,
        gradient: buildGradient(styleConfig.dots),
      },

      cornersSquareOptions: {
        type: styleConfig.cornersSquare.type as any,
        color: styleConfig.cornersSquare.color,
        gradient: buildGradient(styleConfig.cornersSquare),
      },

      cornersDotOptions: {
        type: styleConfig.cornersDot.type as any,
        color: styleConfig.cornersDot.color,
        gradient: buildGradient(styleConfig.cornersDot),
      },

      backgroundOptions: {
        color: styleConfig.background.color,
        gradient: buildGradient(styleConfig.background),
      },

      imageOptions: {
        imageSize: styleConfig.logo.size,
        margin: styleConfig.logo.margin,
        hideBackgroundDots: styleConfig.logo.hideBackgroundDots,
        crossOrigin: "anonymous",
      },
    };

    // ---------- Create ----------
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options);
      ref.current.innerHTML = "";
      qrRef.current.append(ref.current);
      onReady?.(qrRef.current);
    }
    // ---------- Update ----------
    else {
      qrRef.current.update(options);
    }
  }, [value, size, styleConfig]);

  return <div ref={ref} />;
}
