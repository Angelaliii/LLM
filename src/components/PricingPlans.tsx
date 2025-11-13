import React, { useState } from "react";
import { getCurrentCopy } from "../data/copy";
import { useUIStore } from "../store/useUIStore";
import CTAButton from "./CTAButton";
import Icon from "./Icon";

const PricingPlans: React.FC = () => {
  const { variant } = useUIStore();
  const copy = getCurrentCopy(variant);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  return (
    <section
      id="pricing"
      className="section-padding bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container-max">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Icon name="star" size="sm" className="mr-2" />
            方案價格
          </div>
          <h2 className="text-heading-2 text-dark-900 mb-4">
            {copy.pricing.title}
          </h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            {copy.pricing.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {copy.pricing.plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg p-8 relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 cursor-pointer ${
                index === 1
                  ? "ring-2 ring-primary-500 scale-105 shadow-2xl"
                  : ""
              } ${selectedPlan === plan.name ? "ring-2 ring-primary-500" : ""}`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    🏆 最受歡迎
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-500">
                    {plan.price}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <Icon
                        name="check"
                        size="sm"
                        className="text-primary-500 mt-1 flex-shrink-0"
                      />
                      <span className="text-dark-700 text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <CTAButton
                  variant={index === 1 ? "primary" : "secondary"}
                  className="w-full"
                  to="/chat/"
                  openInNewTab
                  trackingLabel={plan.cta}
                  trackingLocation="pricing"
                >
                  {plan.cta}
                </CTAButton>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-dark-700 mb-4">需要客製化方案或有其他問題？</p>
          <CTAButton
            variant="ghost"
            to="/chat/"
            openInNewTab
            trackingLabel="聯絡專人服務"
            trackingLocation="pricing-footer"
          >
            <Icon name="email" size="sm" className="mr-2" />
            聯絡專人服務
          </CTAButton>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
