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

      {/* 聯絡表單區域 */}
      <div id="contact" className="bg-primary-500 py-16">
        <div className="container-max">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              準備開始您的歷史教學革命？
            </h3>
            <p className="text-primary-100 mb-8">
              填寫下方表單，我們將在 24
              小時內與您聯繫，提供完整的產品展示與客製化建議
            </p>

            <form className="bg-white rounded-xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-dark-900 mb-2"
                  >
                    姓名 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入您的姓名"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-dark-900 mb-2"
                  >
                    電子郵件 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入您的電子郵件"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-dark-900 mb-2"
                  >
                    身分 *
                  </label>
                  <select
                    id="role"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">請選擇身分</option>
                    <option value="teacher">教師</option>
                    <option value="student">學生</option>
                    <option value="parent">家長</option>
                    <option value="administrator">教育行政人員</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="institution"
                    className="block text-sm font-medium text-dark-900 mb-2"
                  >
                    學校/機構
                  </label>
                  <input
                    type="text"
                    id="institution"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入學校或機構名稱"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  需求說明
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="請簡述您的需求或想了解的內容..."
                ></textarea>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Icon name="arrow" size="sm" className="mr-2" />
                  立即提交，開始免費體驗
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                提交表單即表示您同意我們的隱私政策。我們承諾不會將您的資料用於其他用途。
              </p>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
