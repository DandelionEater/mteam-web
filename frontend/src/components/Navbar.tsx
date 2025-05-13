import React, { useState, useRef } from 'react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import logo from "../assets/MTEAM_logotipas_be fono - šviesiam.png";
import CartOverlay from "./CartOverlay";
import DesignInfo from './DesignInfo';
import { BaseDesign } from '../types';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const [isDesignInfoOpen, setIsDesignInfoOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<BaseDesign | null>(null);

  const cartIconDesktopRef = useRef<HTMLDivElement>(null);
  const cartIconMobileRef = useRef<HTMLDivElement>(null);

  const flexBetween = "flex items-center justify-between";
  
  const navLinks = [
    { label: t('nav.home'), path: "/" },
    { label: t('nav.designs'), path: "/designs" },
    { label: t('nav.gallery'), path: "/gallery" },
    { label: t('nav.about'), path: "/about" },
    { label: t('nav.contacts'), path: "/contacts" }
  ];

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'lt' : 'en');
  };

  const closeDesignInfo = () => {
    setIsDesignInfoOpen(false);
    setSelectedDesign(null);
  };

  const location = useLocation();

  return (
    <nav className={`${flexBetween} fixed top-0 z-30 w-full py-6 px-4 bg-gray-900 shadow-md`}>
      <div className={`${flexBetween} mx-auto w-full max-w-screen-xl`}>
        <div className={`${flexBetween} w-full gap-16`}>
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 object-contain" />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm pr-4">
          {navLinks.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} className="relative text-white py-2 text-center">
                <motion.span
                  className="relative"
                  whileHover="hover"
                  initial={isActive ? "hover" : "rest"}
                  animate={isActive ? "hover" : "rest"}
                >
                  {label}
                  <motion.span
                    variants={{
                      rest: { width: "0", left: "50%" },
                      hover: { width: "100%", left: "0%" },
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 h-0.5 bg-white"
                    style={{ transform: "translateY(2px)" }}
                  />
                </motion.span>
              </Link>
            );
          })}

            {/* Cart icon on desktop */}
            <div ref={cartIconDesktopRef} className="relative">
              <button onClick={() => setIsCartOpen(prev => !prev)} className="relative text-white">
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="text-white text-sm border px-3 py-1 rounded-lg hover:bg-white hover:text-gray-900 transition"
            >
              {t('nav.languageToggle')}
            </button>
          </div>

          {/* Mobile Burger Icon */}
          <div className="md:hidden flex items-center pr-3" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} absolute left-0 top-full w-full bg-gray-900 py-4 shadow-md border-t border-gray-500`}>
      {navLinks.map(({ label, path }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={() => setIsMenuOpen(false)}
            className={`block text-white py-2 text-center ${isActive ? "underline font-semibold" : "hover:text-gray-400"}`}
          >
            {label}
          </Link>
        );
      })}

        <div className="flex justify-center py-2" ref={cartIconMobileRef}>
          <Link to="/cart" className="text-white" onClick={() => setIsMenuOpen(false)}>
            <span className="md:hidden">{t('nav.cart')}</span>
            <span className="hidden md:block">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </span>
          </Link>
        </div>

        <div className="flex justify-center py-2">
          <button
            onClick={() => {
              toggleLanguage();
              setIsMenuOpen(false);
            }}
            className="text-white text-sm border px-3 py-1 rounded-lg hover:bg-white hover:text-gray-900 transition"
          >
            {t('nav.languageToggle')}
          </button>
        </div>
      </div>

      {/* Cart Overlay */}
      {isCartOpen && (
        <CartOverlay
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          anchorRef={cartIconDesktopRef}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      {/* DesignInfo Section */}
      {isDesignInfoOpen && selectedDesign && (
        <DesignInfo
          isOpen={isDesignInfoOpen}
          onClose={closeDesignInfo}
          design={selectedDesign}
        />
      )}
    </nav>
  );
};

export default Navbar;
