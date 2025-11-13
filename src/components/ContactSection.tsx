import React from "react";
import Icon from "./Icon";

const ContactSection: React.FC = () => {
  return (
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
  );
};

export default ContactSection;
