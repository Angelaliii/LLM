// 事件追蹤服務
export interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventLabel?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  conversionType:
    | "form_submit"
    | "cta_click"
    | "demo_interaction"
    | "pricing_view";
  variant?: string;
}

export class AnalyticsService {
  private static sessionId: string = this.generateSessionId();
  private static userId?: string;
  private static events: AnalyticsEvent[] = [];

  // 生成 Session ID
  private static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 設定用戶 ID
  static setUserId(userId: string): void {
    this.userId = userId;
  }

  // 追蹤通用事件
  static trackEvent(
    eventName: string,
    eventCategory: string,
    eventLabel?: string,
    value?: number,
    customData?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      eventName,
      eventCategory,
      eventLabel,
      value,
      customData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: window.location.pathname + window.location.hash,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // 追蹤轉化事件
  static trackConversion(
    conversionType: ConversionEvent["conversionType"],
    eventLabel?: string,
    variant?: string,
    customData?: Record<string, any>
  ): void {
    const event: ConversionEvent = {
      eventName: "conversion",
      eventCategory: "conversion",
      eventLabel,
      conversionType,
      variant,
      customData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: window.location.pathname + window.location.hash,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // CTA 點擊追蹤
  static trackCTAClick(
    ctaText: string,
    ctaLocation: string,
    variant?: string
  ): void {
    this.trackConversion("cta_click", `${ctaText} - ${ctaLocation}`, variant, {
      ctaText,
      ctaLocation,
    });
  }

  // 表單提交追蹤
  static trackFormSubmit(
    formType: string,
    formData: Record<string, any>
  ): void {
    this.trackConversion("form_submit", formType, undefined, {
      formType,
      formData: {
        role: formData.role,
        institution: formData.institution ? "provided" : "not_provided",
        // 不記錄敏感個人資訊
      },
    });
  }

  // Demo 互動追蹤
  static trackDemoInteraction(
    actionType: string,
    details?: Record<string, any>
  ): void {
    this.trackConversion("demo_interaction", actionType, undefined, {
      actionType,
      details,
    });
  }

  // 價格方案查看追蹤
  static trackPricingView(planName: string, planPrice: string): void {
    this.trackConversion("pricing_view", planName, undefined, {
      planName,
      planPrice,
    });
  }

  // 頁面瀏覽追蹤
  static trackPageView(pageName: string): void {
    this.trackEvent("page_view", "navigation", pageName, undefined, {
      referrer: document.referrer,
      timestamp: Date.now(),
    });
  }

  // 滾動深度追蹤
  static trackScrollDepth(depth: number): void {
    this.trackEvent("scroll_depth", "engagement", `${depth}%`, depth);
  }

  // 時間追蹤
  static trackTimeOnPage(timeSpent: number): void {
    this.trackEvent("time_on_page", "engagement", "seconds", timeSpent);
  }

  // 發送事件（實際環境中會發送到分析服務）
  private static sendEvent(event: AnalyticsEvent): void {
    // 本地存儲（開發環境）
    try {
      const existingEvents = JSON.parse(
        localStorage.getItem("analytics_events") || "[]"
      );
      existingEvents.push(event);
      localStorage.setItem("analytics_events", JSON.stringify(existingEvents));
    } catch (error) {
      console.warn("Failed to store analytics event:", error);
    }

    // 控制台輸出（開發環境）
    console.log("Analytics Event:", event);

    // 生產環境中使用 Beacon API 或 fetch
    if (navigator.sendBeacon && "API_ENDPOINT" in window) {
      try {
        navigator.sendBeacon("/api/analytics", JSON.stringify(event));
      } catch (error) {
        console.warn("Failed to send analytics via beacon:", error);
      }
    }
  }

  // 獲取所有事件（用於調試）
  static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // 清除事件（用於測試）
  static clearEvents(): void {
    this.events = [];
    localStorage.removeItem("analytics_events");
  }

  // 初始化追蹤
  static init(): void {
    // 追蹤頁面載入
    this.trackPageView("landing_page");

    // 追蹤滾動深度
    let maxScrollDepth = 0;
    const trackScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth;
        this.trackScrollDepth(scrollDepth);
      }
    };

    window.addEventListener("scroll", trackScroll, { passive: true });

    // 追蹤頁面停留時間
    let startTime = Date.now();
    const trackTimeBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      this.trackTimeOnPage(timeSpent);
    };

    window.addEventListener("beforeunload", trackTimeBeforeUnload);
  }
}

// React Hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: AnalyticsService.trackEvent,
    trackConversion: AnalyticsService.trackConversion,
    trackCTAClick: AnalyticsService.trackCTAClick,
    trackFormSubmit: AnalyticsService.trackFormSubmit,
    trackDemoInteraction: AnalyticsService.trackDemoInteraction,
    trackPricingView: AnalyticsService.trackPricingView,
    trackPageView: AnalyticsService.trackPageView,
  };
};
