// 無障礙輔助工具
export class A11yHelper {
  // 跳轉到主要內容
  static skipToMain(): void {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  }

  // 焦點管理
  static manageFocus(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }

  // 鍵盤導覽處理
  static handleKeyboardNavigation(
    event: KeyboardEvent,
    callback: () => void
  ): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  }

  // 設定 ARIA 屬性
  static setAriaExpanded(elementId: string, expanded: boolean): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute("aria-expanded", expanded.toString());
    }
  }

  // 設定 ARIA 標籤
  static setAriaLabel(elementId: string, label: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute("aria-label", label);
    }
  }

  // 宣告動態內容變更
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // 檢查色彩對比度
  static checkColorContrast(
    _backgroundColor: string,
    _textColor: string
  ): boolean {
    // 顏色對比度檢查實現
    // 暫時返回 true，實際應用中應實現 WCAG 對比度計算
    return true;
  }

  // 設定焦點陷阱（用於 Modal）
  static trapFocus(containerElement: HTMLElement): () => void {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerElement.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    // 返回清理函數
    return () => {
      containerElement.removeEventListener("keydown", handleTabKey);
    };
  }
}

// React Hook for accessibility
export const useA11y = () => {
  return {
    skipToMain: A11yHelper.skipToMain,
    manageFocus: A11yHelper.manageFocus,
    handleKeyboardNav: A11yHelper.handleKeyboardNavigation,
    setAriaExpanded: A11yHelper.setAriaExpanded,
    setAriaLabel: A11yHelper.setAriaLabel,
    announce: A11yHelper.announceToScreenReader,
    trapFocus: A11yHelper.trapFocus,
  };
};
