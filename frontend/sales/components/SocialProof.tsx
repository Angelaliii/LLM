import React from "react";
import { testimonials } from "../../app/data/testimonials";
import Icon from "./Icon";

const SocialProof: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-heading-2 text-dark-900 mb-4">
            師生家長一致推薦
          </h2>
          <p className="text-xl text-dark-700">
            已有上千位師生體驗，見證歷史學習的革命性改變
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div key={testimonial.id} className="card">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size="sm"
                    className="text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-dark-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-dark-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-dark-700">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-primary-500">
                    {testimonial.institution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
