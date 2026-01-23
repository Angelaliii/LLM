import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";
import { useAnalytics } from "../../app/services/analytics";
import CTAButton from "./CTAButton";
import Icon from "./Icon";

gsap.registerPlugin(ScrollTrigger);

// Two sets of demo Q&A; display order: user(Q) right side → historical figure(A) left side → next Q → A
const qaPairs = [
  {
    q: "Why did you unify the written language?",
    a: "Unifying the written language promotes the transmission of government decrees and cultural integration, reducing regional divisions, which is essential for governing a unified empire.",
  },
  {
    q: "Who built the Great Wall?",
    a: "The Great Wall was constructed by border defense forces and laborers across different periods. After unifying the Six States, I implemented projects to connect and strengthen it to defend against external threats.",
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
            Experience Historical Dialogue Instantly
          </h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            Engage directly with historical figures from the Japanese colonial period and experience revolutionary history learning. Enter your questions and get first-person responses instantly.
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
                  <h3 className="text-xl font-bold">Historical Figure from Japanese Colonial Period</h3>
                  <p className="text-primary-100">Emperor Qin Shi Huang • Unified Six States • Online</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 text-primary-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Real-time Response</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 聊天內容：滾動顯示 — 右側 user、左側 assistant（每個氣泡逐一顯示） */}
            <div ref={containerRef} className="overflow-y-auto p-6 space-y-4">
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
                Want the Full Experience? Start Your Free Trial Now
              </h3>
              <p className="text-dark-700 mb-6">
                The above is a simplified preview. The complete version includes richer historical figures, in-depth dialogues, and comprehensive teaching management features.
              </p>
              <CTAButton
                size="lg"
                to="/game"
                openInNewTab
                trackingLabel="Start Full Experience"
                trackingLocation="demo-cta"
              >
                <Icon name="play" size="sm" className="mr-2" />
                Start Full Experience
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
