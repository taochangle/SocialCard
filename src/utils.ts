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
