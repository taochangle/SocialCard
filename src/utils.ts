export const formatStars = (stars: string) => {
  if (!stars) return "";
  const normalized = stars.toLowerCase().replace(/,/g, "");
  if (normalized.includes("k")) return normalized;
  const num = parseFloat(normalized);
  if (isNaN(num)) return stars;
  if (num >= 1000) {
    const k = num / 1000;
    return (k % 1 === 0 ? Math.floor(k) : k.toFixed(1)) + "k";
  }
  return String(num);
};

const getLuminance = (bg: string) => {
  const hex = bg.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) =>
    parseInt(hex.slice(i, i + 2), 16) / 255
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Mask for the uncovered top/bottom bands of the 9:16 shell.
// Keeps the background color visible underneath, dimmed by a translucent scrim.
export const getMaskGradient = (bg: string, direction: "top" | "bottom") => {
  const channel = getLuminance(bg) > 0.5 ? "0, 0, 0" : "255, 255, 255";
  const stops = [0.6, 0.35, 0.15];
  return direction === "top"
    ? `linear-gradient(to bottom, rgba(${channel}, ${stops[0]}), rgba(${channel}, ${stops[1]}), rgba(${channel}, ${stops[2]}))`
    : `linear-gradient(to top, rgba(${channel}, ${stops[0]}), rgba(${channel}, ${stops[1]}), rgba(${channel}, ${stops[2]}))`;
};

export const dataURLtoBlob = (dataUrl: string) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const waitForImages = async (container: HTMLElement) => {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // force reload if not started
          if (!img.src) resolve();
        }),
    ),
  );
};
