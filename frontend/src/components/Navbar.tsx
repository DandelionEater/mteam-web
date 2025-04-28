import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import logo from "../assets/MTEAM_logotipas_be fono - šviesiam.png";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Manage burger menu state

  const flexBetween = "flex items-center justify-between";
  const navLinks = ["Home", "About"];

  return (
    <nav className={`${flexBetween} fixed top-0 z-30 w-full py-6 px-4 bg-white shadow-md`}>
      <div className={`${flexBetween} mx-auto w-full max-w-screen-xl`}>
        <div className={`${flexBetween} w-full gap-16`}>
          {/* Left side: Logo */}
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 object-contain" />
          </div>

          {/* Right side: Desktop links */}
          <div className={`hidden md:flex items-center gap-8 text-sm`}>
            {navLinks.map((link) => (
              <Link key={link} to={`/${link.toLowerCase()}`} className="text-gray-900 hover:text-gray-600">
                {link}
              </Link>
            ))}
          </div>

          {/* Mobile Burger Icon */}
          <div className="md:hidden flex items-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-900" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-900" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu: Links visible when the menu is open */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} absolute left-0 top-full w-full bg-white py-4 shadow-md border-t border-gray-500`}>
        {navLinks.map((link) => (
          <Link
            key={link}
            to={`/${link.toLowerCase()}`}
            className="block text-gray-900 hover:text-gray-600 py-2 text-center"
          >
            {link}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
