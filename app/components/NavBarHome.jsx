// app/components/NavBarHome.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

const NavBarHome = ({ fontColor = 'text-blue', bgColor = 'bg-beige' }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className={`${bgColor} p-4`}>
      <div className="container mx-5 flex justify-between items-center">
      <Logo fontColor={fontColor} />
        <div className="flex space-x-10">
          <Link href="/" passHref>
            <span className={`${fontColor} cursor-pointer font-medium`}>Home</span>
          </Link>
          <div className="relative">
            <span
              className={`${fontColor} cursor-pointer font-medium`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Profile
            </span>
            {dropdownOpen && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-navy text-white shadow-lg z-10">
                <Link href="/login" passHref>
                  <span className="block px-4 py-2 hover:bg-beige  hover:text-navy cursor-pointer text-center">
                    Login/Register
                  </span>
                </Link>
                <Link href="/cart" passHref>
                  <span className="block px-4 py-2 hover:bg-beige hover:text-navy cursor-pointer text-center">
                    Cart
                  </span>
                </Link>
                <Link href="/wishlist" passHref>
                  <span className="block px-4 py-2 hover:bg-beige hover:text-navy cursor-pointer text-center">
                    Wishlist
                  </span>
                </Link>
              </div>
            )}
          </div>
          <Link href="/about" passHref>
            <span className={`${fontColor} cursor-pointer font-medium`}>About Us</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBarHome;
