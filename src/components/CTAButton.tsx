import React from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../services/analytics";

interface CTAButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
  to?: string; // 新增路由跳轉支援
  openInNewTab?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  trackingLabel?: string;
  trackingLocation?: string;
}

const variantClasses = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white border-transparent",
  secondary:
    "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white",
  ghost: "bg-transparent text-primary-500 hover:bg-primary-50",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  href,
  to,
  openInNewTab = false,
  disabled = false,
  loading = false,
  className = "",
  ariaLabel,
  trackingLabel,
  trackingLocation = "unknown",
}) => {
  const { trackCTAClick } = useAnalytics();
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled || loading) return;

    // 追蹤點擊事件
    if (trackingLabel) {
      trackCTAClick(trackingLabel, trackingLocation);
    }

    // 執行點擊回調
    if (onClick) {
      onClick();
    }

    // 處理路由跳轉
    if (to) {
      if (openInNewTab) {
        // 開新分頁導向 app route
        const origin = (globalThis as any).location?.origin ?? "";
        window.open(origin + to, "_blank");
        return;
      }
      navigate(to);
      return;
    }

    // 處理錨點滾動
    if (href?.startsWith("#")) {
      const target = document.getElementById(href.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `;

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  // 如果是外部連結
  if (href && !href.startsWith("#")) {
    const targetAttr =
      openInNewTab || href.startsWith("http") ? "_blank" : undefined;
    const relAttr = targetAttr ? "noopener noreferrer" : undefined;
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={handleClick}
        target={targetAttr}
        rel={relAttr}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </a>
    );
  }

  // 一般按鈕
  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      type="button"
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default CTAButton;
