import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";
import { useAnalytics } from "../services/analytics";
import CTAButton from "./CTAButton";
import Icon from "./Icon";

gsap.registerPlugin(ScrollTrigger);

// 兩組示範問答；展示順序為：使用者(Q) 右側 → 秦始皇(A) 左側 → 下一組 Q → A
const qaPairs = [
  {
    q: "您為什麼要統一文字？",
    a: "統一文字能促進政令傳達與文化整合，減少地方隔閡，對於治理大一統國家十分重要。",
  },
  {
    q: "長城是誰建的？",
    a: "長城由各時期邊防與民夫共同構築，始皇時期統一六國後，進行了連接與加固的工程以防外患。",
  },
];

const LiveDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { trackDemoInteraction } = useAnalytics();
  // 扁平化成依序顯示的氣泡：user(right) -> assistant(left) -> ...
  const bubbles = qaPairs.flatMap((p) => [
    { role: "user", text: p.q },
    { role: "assistant", text: p.a },
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 建立按顯示順序的一維氣泡清單：user(right), assistant(left), user, assistant
    const bubbles = qaPairs.flatMap((p) => [
      { role: "user", text: p.q },
      { role: "assistant", text: p.a },
    ]);

    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(".chat-bubble")
    );

    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              trackDemoInteraction?.("demo_bubble_reveal", {
                index: i,
                role: bubbles[i]?.role,
              });
            },
          },
        }
      );
    }

    return () => {
      for (const st of ScrollTrigger.getAll()) st.kill();
      gsap.killTweensOf(items as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  return (
    <section id="demo" className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-heading-2 text-dark-900 mb-4">
            立即體驗歷史對話
          </h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            與秦始皇直接對話，感受革命性的歷史學習體驗。輸入您的問題，立即獲得第一人稱回應。
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 聊天頭部 */}
            <div className="bg-primary-500 text-white p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="user" size="md" className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">秦始皇嬴政</h3>
                  <p className="text-primary-100">始皇帝 • 統一六國 • 在線中</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 text-primary-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">即時回應</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 聊天內容：滾動顯示 — 右側 user、左側 assistant（每個氣泡逐一顯示） */}
            <div
              ref={containerRef}
              className="h-96 overflow-y-auto p-6 space-y-4"
            >
              {bubbles.map((b, i) => (
                <div
                  key={`bubble-${i}-${b.role}`}
                  className={`${
                    b.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  <div
                    className={`chat-bubble max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      b.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-dark-900"
                    }`}
                  >
                    {b.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA 區域 */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-dark-900 mb-4">
                想要完整體驗？立即開始免費試用
              </h3>
              <p className="text-dark-700 mb-6">
                上方僅為簡化展示，完整版本包含更豐富的歷史人物、深度對話與教學管理功能
              </p>
              <CTAButton
                size="lg"
                to="/chat/"
                openInNewTab
                trackingLabel="開始完整體驗"
                trackingLocation="demo-cta"
              >
                <Icon name="play" size="sm" className="mr-2" />
                開始完整體驗
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
