import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import logo from "../assets/MTEAM_logotipas_be fono - šviesiam.png";
import CartOverlay from "./CartOverlay";
import DesignInfo from './DesignInfo';
import { BaseDesign, CartItem } from '../types';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const [isDesignInfoOpen, setIsDesignInfoOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<BaseDesign | null>(null);

  const cartIconDesktopRef = useRef<HTMLDivElement>(null);
  const cartIconMobileRef = useRef<HTMLDivElement>(null);

  const updateCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const onUpdateQuantity = (id: number, quantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    updateCart(updatedCart);
  };
  
  const onRemoveItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    updateCart(updatedCart);
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("cart");
      if (stored) setCartItems(JSON.parse(stored));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const flexBetween = "flex items-center justify-between";
  
  const navLinks = [
    { label: t('nav.home'), path: "/" },
    { label: t('nav.designs'), path: "/designs" },
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
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="relative text-white py-2 text-center"
              >
                <motion.span
                  className="relative"
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
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
            ))}

            {/* Cart icon */}
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

          {/* Mobile Toggle Icon */}
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
        {navLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className="block text-white hover:text-gray-400 py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            {label}
          </Link>
        ))}

        {/* Cart icon */}
        <div className="flex justify-center py-2" ref={cartIconMobileRef}>
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
          onClick={() => {
            toggleLanguage();
            setIsMenuOpen(false);
          }}
          className="block text-white hover:text-gray-400 py-2 text-center"
        >
          {t('nav.languageToggle')}
        </button>
      </div>

      {/* Cart Overlay */}
      {isCartOpen && (
        <CartOverlay
          key={JSON.stringify(cartItems)} // forces rerender when cart changes
          items={cartItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
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
