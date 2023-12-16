export const calculateTime = (secs: number) => {
  const minutes = Math.floor(secs / 60);
  const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${returnedMinutes}:${returnedSeconds}`;
};

//export function timestampToDate(timestamp: number): string {
//  const timestampLength = timestamp.toString().length;
//  const date =
//    timestampLength === 13 ? new Date(timestamp) : new Date(timestamp * 1000);
//  return date.toLocaleString(); // Adjust format using toLocaleDateString(), toLocaleTimeString(), etc.
//}

export function timestampToDate(timestamp: number): string {
  const dateObj = new Date(timestamp * 1000);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options);
  return formattedDate;
}

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : process.env.NEXT_PUBLIC_DOMAIN;

export async function dynamicBlurDataUrl(url: string) {
  const base64str = await fetch(
    `${baseUrl}/_next/image?url=${url}&w=16&q=75`,
  ).then(async (res) =>
    Buffer.from(await res.arrayBuffer()).toString("base64"),
  );

  const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='1' />
      </filter>

      <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
      href='data:image/avif;base64,${base64str}' />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
}
