import React from "react";
import Icon from "./Icon";

const ContactSection: React.FC = () => {
  return (
    <div id="contact" className="bg-primary-500 py-16">
      <div className="container-max">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your History Teaching Revolution?
          </h3>
          <p className="text-primary-100 mb-8">
            Fill out the form below, and we will contact you within 24
            hours to provide a complete product demonstration and customized recommendations
          </p>

          <form className="bg-white rounded-xl p-8 shadow-xl text-left">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Role *
                </label>
                <select
                  id="role"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="institution"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  School/Organization
                </label>
                <input
                  type="text"
                  id="institution"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter school or organization name"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-dark-900 mb-2"
              >
                Requirements Description
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Please briefly describe your needs or what you'd like to know..."
              ></textarea>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Icon name="arrow" size="sm" className="mr-2" />
                Submit Now, Start Free Trial
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By submitting this form, you agree to our privacy policy. We promise not to use your data for any other purpose.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
