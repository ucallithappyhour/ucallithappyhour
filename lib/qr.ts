export function buildQrUrl(
  text: string,
  size = 900,
  margin = 2
) {
  const logoUrl = "https://www.ucallithappyhour.com/ucallit-qr-logo.png";

  return (
    "https://quickchart.io/qr" +
    `?text=${encodeURIComponent(text)}` +
    `&size=${size}` +
    `&margin=${margin}` +
    `&centerImageUrl=${encodeURIComponent(logoUrl)}` +
    `&centerImageSizeRatio=0.18`
  );
}