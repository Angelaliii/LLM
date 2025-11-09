import React, { useState } from "react";
import { faqData } from "../data/faq";
import Icon from "./Icon";

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-heading-2 text-dark-900 mb-4">常見問題解答</h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            我們整理了使用者最關心的問題，幫助您快速了解產品詳情
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={openItems.includes(item.id)}
                >
                  <span className="font-semibold text-dark-900 pr-4">
                    {item.question}
                  </span>
                  <Icon
                    name={openItems.includes(item.id) ? "close" : "arrow"}
                    size="sm"
                    className={`text-primary-500 transition-transform duration-200 ${
                      openItems.includes(item.id) ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {openItems.includes(item.id) && (
                  <div className="px-6 pb-4">
                    <p className="text-dark-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-dark-900 mb-4">
                還有其他問題？
              </h3>
              <p className="text-dark-700 mb-6">
                我們的專業團隊隨時為您解答，提供最適合的解決方案
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@example.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  <Icon name="email" size="sm" className="mr-2" />
                  發送郵件詢問
                </a>
                <a
                  href="tel:+886-2-1234-5678"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-200"
                >
                  <Icon name="phone" size="sm" className="mr-2" />
                  電話諮詢
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
