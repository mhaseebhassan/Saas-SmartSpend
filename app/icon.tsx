import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
        >
          <path
            d="M 27.5 20 h 15 a 15 15 0 0 1 0 30 h -10 a 15 15 0 0 0 0 30 h 15"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 52.5 20 h 15 a 15 15 0 0 1 0 30 h -10 a 15 15 0 0 0 0 30 h 15"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
