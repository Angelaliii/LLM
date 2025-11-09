import React from "react";

interface IconProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  "aria-label"?: string;
}

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const iconPaths: Record<string, string> = {
  // 基礎圖標
  menu: "M3 12h18m-9-9v18",
  close: "M18 6L6 18M6 6l12 12",
  arrow: "M19 12H5m7-7l-7 7 7 7",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",

  // 功能圖標
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  users:
    "M17 21v-2a4 4 0 00-3-3.87M13.73 7.8a5 5 0 110 8.4M9 12a3 3 0 100-6 3 3 0 000 6zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2z",
  book: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  clock: "M12 2v10l4 4",

  // 社交圖標
  email:
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",

  // 介面圖標
  play: "M8 5v14l11-7z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  external:
    "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}) => {
  const path = iconPaths[name];

  if (!path) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      className={`${iconSizes[size]} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : "presentation"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={path}
      />
    </svg>
  );
};

export default Icon;
