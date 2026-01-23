import React from "react";
import { getCurrentCopy } from "../../app/data/copy";
import { useUIStore } from "../../app/store/useUIStore";
import Icon from "./Icon";

const FeatureGrid: React.FC = () => {
  const { variant } = useUIStore();
  const copy = getCurrentCopy(variant);

  const iconMap = ["chat", "users", "book"];

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Icon name="star" size="sm" className="mr-2" />
            Core Advantages
          </div>
          <h2 className="text-heading-2 text-dark-900 mb-4">Three Core Advantages</h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            Revolutionary LLM technology combined with history education creates a brand new learning experience for teachers and students
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {copy.features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon
                  name={iconMap[index] || "star"}
                  size="lg"
                  className="text-white"
                />
              </div>

              <h3 className="text-heading-3 text-dark-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-dark-700 mb-4 leading-relaxed">
                {feature.description}
              </p>

              <div className="inline-flex items-center text-primary-500 font-medium text-sm">
                <Icon name="check" size="sm" className="mr-2" />
                {feature.proof}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
