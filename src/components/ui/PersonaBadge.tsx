import React from "react";
import { qinShiHuangPersona } from "../../services/prompts/persona.qinShihuang";

interface PersonaBadgeProps {
  personaId: string;
  size?: "small" | "medium" | "large";
  showDescription?: boolean;
}

const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  personaId,
  size = "medium",
  showDescription = false,
}) => {
  // TODO: 從 persona 配置獲取數據，目前使用預設配置
  const persona = personaId === "qin-shi-huang" ? qinShiHuangPersona : null;

  if (!persona) {
    return <div className="text-gray-500 dark:text-gray-400">未知人物</div>;
  }

  const sizeClasses = {
    small: {
      container: "flex items-center space-x-2",
      avatar: "w-8 h-8 text-sm",
      text: "text-sm",
      period: "text-xs",
    },
    medium: {
      container: "flex items-center space-x-3",
      avatar: "w-12 h-12 text-lg",
      text: "text-base",
      period: "text-sm",
    },
    large: {
      container: "flex items-center space-x-4",
      avatar: "w-16 h-16 text-xl",
      text: "text-lg",
      period: "text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={classes.container}>
      {/* 人物頭像 */}
      <div
        className={`${classes.avatar} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
      >
        始
      </div>

      {/* 人物資訊 */}
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <h3
            className={`${classes.text} font-bold text-gray-900 dark:text-gray-100`}
          >
            {persona.name}
          </h3>
          <span
            className={`${classes.period} text-gray-500 dark:text-gray-400 font-medium`}
          >
            {persona.period}
          </span>
        </div>

        {showDescription && (
          <p
            className={`${classes.period} text-gray-600 dark:text-gray-300 mt-1 max-w-md`}
          >
            {persona.description}
          </p>
        )}
      </div>

      {/* 狀態指示器 */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 dark:text-green-400">在線</span>
      </div>
    </div>
  );
};

export default PersonaBadge;
