import React from "react";
import Icon from "./Icon";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white relative overflow-hidden">
      <div className="container-max py-12 px-6 relative">
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr,1fr] items-start">
          {/* Brand */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Icon name="chat" size="md" className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Time Talk</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered historical learning with mission-based stages, guided prompts, and archive repair gameplay.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <nav className="grid grid-cols-2 gap-3 text-sm">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-gray-400 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                <Icon name="email" size="sm" className="mr-2" />
                Email Us
              </a>
              <a
                href="tel:+886-2-1234-5678"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-primary-400 text-gray-100 hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Icon name="phone" size="sm" className="mr-2" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright section */}
      <div className="border-t border-gray-800">
        <div className="container-max py-6 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">© 2026 Time Talk. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-full opacity-10 pointer-events-none">
        <div className="absolute bottom-10 left-14 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 right-10 w-40 h-40 bg-accent-500 rounded-full blur-3xl"></div>
      </div>
    </footer>
  );
};

export default Footer;
