import React from "react";
import Icon from "./Icon";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white relative">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max py-16 relative">
        <div className="grid md:grid-cols-4 gap-8">
          {/* 公司資訊 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Icon name="chat" size="md" className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">歷史對話系統</h3>
                <p className="text-gray-400 text-sm">LLM 互動教學平台</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              革命性的歷史教學平台，運用先進的 LLM
              技術，讓學生與歷史人物直接對話，
              創造沉浸式的學習體驗，提升歷史教育的趣味性與效果。
            </p>

            <div className="flex space-x-4">
              <a
                href="mailto:contact@example.com"
                className="text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Icon name="email" size="md" />
              </a>
              <a
                href="tel:+886-2-1234-5678"
                className="text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Icon name="phone" size="md" />
              </a>
            </div>
          </div>

          {/* 產品連結 */}
          <div>
            <h4 className="font-semibold mb-4">產品服務</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  產品特色
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  互動展示
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  方案價格
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  常見問題
                </a>
              </li>
            </ul>
          </div>

          {/* 支援連結 */}
          <div>
            <h4 className="font-semibold mb-4">客戶支援</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  使用手冊
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  技術支援
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  聯絡我們
                </a>
              </li>
              <li>
                <a
                  href="/feedback"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  意見回饋
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 底部版權區 */}
      <div className="border-t border-gray-800">
        <div className="container-max py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 歷史對話系統. 版權所有.
              </p>
              <div className="flex space-x-4 text-sm">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  隱私政策
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  服務條款
                </a>
                <a
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  法律聲明
                </a>
              </div>
            </div>

            <div className="text-gray-400 text-sm">
              Built with React & TypeScript
            </div>
          </div>
        </div>
      </div>

      {/* 聯絡表單已移出，請放置於 LandingPage main 區塊，確保 footer 在其後 */}
    </footer>
  );
};

export default Footer;
