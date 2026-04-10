import { useState, useCallback } from "react";

export interface ExtractedColors {
  primary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  linkColor: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  sidebarBg: string;
  sidebarActiveBg: string;
  headerBg: string;
  pageBg: string;
  cardBg: string;
  success: boolean;
}

export const useColorExtractor = () => {
  const [extracting, setExtracting] = useState(false);

  const extractColors = useCallback(async (imageUrl: string): Promise<ExtractedColors | null> => {
    if (!imageUrl) return null;

    setExtracting(true);
    try {
      return await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setExtracting(false);
            resolve(null);
            return;
          }

          // Use a small scale for faster processing
          const size = 50;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imageData = ctx.getImageData(0, 0, size, size).data;
          const colorCount: { [key: string]: number } = {};

          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            if (a < 128) continue;
            
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness > 245 || brightness < 10) continue;

            const qr = Math.round(r / 15) * 15;
            const qg = Math.round(g / 15) * 15;
            const qb = Math.round(b / 15) * 15;
            const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;

            colorCount[hex] = (colorCount[hex] || 0) + 1;
          }

          const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);

          if (sortedColors.length === 0) {
            setExtracting(false);
            resolve(null);
            return;
          }

          const primaryHex = sortedColors[0][0];
          let secondaryHex = sortedColors.length > 1 ? sortedColors[1][0] : adjustBrightness(primaryHex, 20);
          
          if (calculateDistance(primaryHex, secondaryHex) < 30) {
            secondaryHex = adjustBrightness(primaryHex, -30);
          }

          const rgb = hexToRgb(primaryHex);
          const brightness = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : 0;
          
          // Generate full palette
          const isDark = brightness < 140;
          
          setExtracting(false);
          resolve({
            primary: primaryHex,
            secondary: secondaryHex,
            textPrimary: isDark ? "#1D2939" : adjustBrightness(primaryHex, -70),
            textSecondary: "#667085",
            linkColor: primaryHex,
            buttonBg: primaryHex,
            buttonText: brightness > 160 ? "#101828" : "#FFFFFF",
            buttonHoverBg: adjustBrightness(primaryHex, -15),
            sidebarBg: primaryHex,
            sidebarActiveBg: adjustBrightness(primaryHex, 15),
            headerBg: isDark ? primaryHex : adjustBrightness(primaryHex, -10),
            pageBg: "#F9FAFB", // Subtle off-white for better UI
            cardBg: "#FFFFFF",
            success: true,
          });
        };

        img.onerror = () => {
          setExtracting(false);
          resolve(null);
        };
      });
    } catch (error) {
      console.error("Error extracting colors:", error);
      setExtracting(false);
      return null;
    }
  }, []);

  return { extractColors, extracting };
};

// Helper functions
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function calculateDistance(hex1: string, hex2: string) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function adjustBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
