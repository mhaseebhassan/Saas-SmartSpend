import { ImageResponse } from "next/og";

export const alt = "SmartSpend - Autonomous Wealth Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        {/* Logo mark — double-S */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="72"
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

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          SmartSpend
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginTop: 16,
            letterSpacing: "0.5px",
          }}
        >
          Autonomous Wealth Management
        </div>

        {/* Subtle bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            width: 80,
            height: 2,
            borderRadius: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
