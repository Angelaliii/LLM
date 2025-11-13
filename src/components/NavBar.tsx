import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentCopy } from "../data/copy";
import { useUIStore } from "../store/useUIStore";
import Icon from "./Icon";

const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, toggleMobileMenu, variant } = useUIStore();
  const copy = getCurrentCopy(variant);
  const location = useLocation();

  // 判斷是否在聊天頁面
  const isChatPage = location.pathname === "/chat";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "產品特色", href: "#features" },
    { label: "互動展示", href: "#demo" },
    { label: "教學優勢", href: "#teaching" },
    { label: "方案價格", href: "#pricing" },
    { label: "常見問題", href: "#faq" },
  ];

  return (
    <nav
      className={`${
        isChatPage ? "relative" : "fixed top-0 left-0 right-0"
      } z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/90 backdrop-blur-sm"
      }`}
      role="navigation"
      aria-label="主要導覽"
    >
      <div className="container-max">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Icon name="chat" size="md" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-900">歷史對話系統</h1>
              <p className="text-xs text-dark-700 hidden sm:block">
                LLM 互動教學平台
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-dark-700 hover:text-primary-500 transition-colors duration-200 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(item.href)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-dark-700 hover:text-primary-500 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="開啟選單"
            aria-expanded={isMobileMenuOpen}
          >
            <Icon name={isMobileMenuOpen ? "close" : "menu"} size="md" />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 border-t border-gray-200" : "max-h-0"
          }`}
        >
          <div className="py-4 px-4 bg-white">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-3 text-dark-700 hover:text-primary-500 transition-colors duration-200 font-medium border-b border-gray-100 last:border-b-0"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(item.href)
                    ?.scrollIntoView({ behavior: "smooth" });
                  toggleMobileMenu();
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
