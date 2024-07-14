'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

const NavBar = ({ fontColor = 'text-navy', bgColor = 'bg-beige' }) => {
  return (
    <nav className={`${bgColor} p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <ul className={`flex space-x-6 ${fontColor}`}>
          <li>
            <Link href="/" passHref>
              <span className="cursor-pointer font-medium text-blue">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/profile" passHref>
              <span className="cursor-pointer font-medium text-blue">Profile</span>
            </Link>
          </li>
          <li>
            <Link href="/wishlist" passHref>
              <span className="cursor-pointer font-medium text-blue">Wishlist</span>
            </Link>
          </li>
          <li>
            <Link href="/cart" passHref>
              <span className="cursor-pointer font-medium text-blue">Cart</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
