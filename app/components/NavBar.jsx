'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';

const NavBar = ({ fontColor = 'text-navy', bgColor = 'bg-beige' }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    // Fetch user data based on JWT token
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.success) {
          setUsername(data.username);  // Set the username from the API response
        } else {
          setUsername('Guest');  // In case of error or unauthorized, default to 'Guest'
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUsername('Guest');  // In case of error, default to 'Guest'
      }
    };

    fetchUser();
  }, []);

  // Toggle dropdown menu
  const toggleProfileMenu = () => {
    setProfileOpen(!isProfileOpen);
  };

  return (
    <nav className={`${bgColor} p-4 relative`}>
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <ul className={`flex space-x-6 ${fontColor}`}>
          <li>
            <Link href="/" passHref>
              <span className="cursor-pointer font-medium text-blue">Home</span>
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
          {/* Profile Dropdown */}
          <li className="relative">
            <span
              className="cursor-pointer font-medium text-blue"
              onClick={toggleProfileMenu}
            >
              Profile
            </span>
            {isProfileOpen && (
              <div className="absolute mt-2 bg-navy text-white p-4 rounded shadow-lg right-0 z-10 w-40">
                <p className="font-semibold mb-2">Hello, {username}!</p>
                <Link href="/orders">
                  <p className="cursor-pointer hover:bg-blue-700 p-2 rounded">Your Orders</p>
                </Link>
                <Link href="/generation">
                  <p className="cursor-pointer hover:bg-blue-700 p-2 rounded">Generation</p>
                </Link>
                <Link href="/measurements">
                  <p className="cursor-pointer hover:bg-blue-700 p-2 rounded">Measurements</p>
                </Link>
                <Link href="/profile">
                  <p className="cursor-pointer hover:bg-blue-700 p-2 rounded">Edit Profile</p>
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
