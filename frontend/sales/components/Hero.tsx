import React from "react";
import { getCurrentCopy } from "../../app/data/copy";
import { useUIStore } from "../../app/store/useUIStore";
import CTAButton from "./CTAButton";
import Icon from "./Icon";

const Hero: React.FC = () => {
  const { variant } = useUIStore();
  const copy = getCurrentCopy(variant);

  return (
    <section
      className="relative bg-gradient-to-br from-amber-50 via-white to-primary-50 py-20 lg:py-32 overflow-hidden"
      id="hero"
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-accent-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-500/5 rounded-full blur-lg"></div>
      </div>

      <div className="container-max relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左側內容 */}
          <div className="animate-slide-up">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                <Icon name="star" size="sm" className="mr-2" />
                革命性 LLM 歷史教學
              </span>
            </div>

            <h1 className="text-heading-1 text-dark-900 mb-6 leading-tight">
              {copy.hero.headline}
            </h1>

            <p className="text-xl text-dark-700 mb-8 leading-relaxed">
              {copy.hero.subheadline}
            </p>

            {/* 特點列表 */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {copy.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1">
                    <Icon name="check" size="sm" className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-dark-700 mt-1">
                      {feature.proof}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA 按鈕組 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton
                size="lg"
                to="/app"
                trackingLabel={copy.hero.cta.primary}
                trackingLocation="hero"
                ariaLabel={`${copy.hero.cta.primary} - 開始免費體驗歷史對話系統`}
              >
                <Icon name="play" size="sm" className="mr-2" />
                {copy.hero.cta.primary}
              </CTAButton>

              <CTAButton
                variant="secondary"
                size="lg"
                href="#demo"
                trackingLabel={copy.hero.cta.secondary}
                trackingLocation="hero"
                ariaLabel={`${copy.hero.cta.secondary} - 觀看互動展示`}
              >
                <Icon name="external" size="sm" className="mr-2" />
                {copy.hero.cta.secondary}
              </CTAButton>
            </div>

            {/* 社會證明數據 */}
            <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">
                  10000%
                </div>
                <div className="text-sm text-dark-700">期待程度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">50+</div>
                <div className="text-sm text-dark-700">待合作學校</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">98%</div>
                <div className="text-sm text-dark-700">期望滿意度</div>
              </div>
            </div>
          </div>

          {/* 右側示意圖 */}
          <div className="animate-fade-in lg:animate-slide-up">
            <div className="relative">
              {/* 主要插圖容器 */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                {/* 對話介面模擬 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <Icon name="user" size="sm" className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-dark-900">
                        日治時期人物
                      </div>
                      <div className="text-sm text-primary-500">● 在線中</div>
                    </div>
                  </div>

                  {/* 對話氣泡 */}
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-primary-500 text-white rounded-lg px-4 py-2 max-w-xs">
                        您好！我想了解統一六國的過程
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-dark-900 rounded-lg px-4 py-3 max-w-sm">
                        <div className="typing-cursor">
                          朕統一六國用時十年，先後滅韓、趙、魏、楚、燕、齊。每滅一國，朕皆深思熟慮...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 輸入框 */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <input
                      type="text"
                      placeholder="輸入您的問題..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      readOnly
                    />
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg">
                      <Icon name="arrow" size="sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 浮動元素 */}
              <div className="absolute -top-4 -right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                30秒啟動
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-lg px-4 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-dark-700">即時回應</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
