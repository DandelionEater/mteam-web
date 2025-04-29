import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from "../assets/MTEAM_logotipas_be fono - šviesiam.png";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Manage burger menu state

  const flexBetween = "flex items-center justify-between";
  const navLinks = ["Home", "Designs", "About"];

  return (
    <nav className={`${flexBetween} fixed top-0 z-30 w-full py-6 px-4 bg-gray-900 shadow-md`}>
      <div className={`${flexBetween} mx-auto w-full max-w-screen-xl`}>
        <div className={`${flexBetween} w-full gap-16`}>
          {/* Left side: Logo */}
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 object-contain" />
          </div>

          {/* Right side: Desktop links */}
          <div className={`hidden md:flex items-center gap-8 text-sm pr-4`}>
            {navLinks.map((link) => (
              <Link
                key={link}
                to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                className="relative text-white py-2 text-center"
              >
                <motion.span
                  className="relative"
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  {link}
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

      {/* Mobile Menu: Links visible when the menu is open */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} absolute left-0 top-full w-full bg-gray-900 py-4 shadow-md border-t border-gray-500`}>
        {navLinks.map((link) => (
          <Link
            key={link}
            to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
            className="block text-white hover:text-gray-400 py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            {link}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
