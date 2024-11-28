'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import NavBar from '../components/NavBar';

function ProfilePage() {
  const [userDetails, setUserDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.success) {
          setUserDetails({
            full_name: data.username,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-beige">
      <NavBar />
      <div className="flex justify-center items-center py-8">
        <div className="w-1/3 h-48 bg-cover bg-center" style={{ backgroundImage: "url('/profile_page_pattern.jpg')" }}></div>
        <div className="relative w-32 h-32 mx-8">
          <Image
            src="/empty_profile.png"
            alt="Profile"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <div className="w-1/3 h-48 bg-cover bg-center" style={{ backgroundImage: "url('/profile_page_pattern.jpg')" }}></div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={userDetails.full_name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={userDetails.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Delivery Address</label>
            <input
              type="text"
              name="address"
              value={userDetails.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-navy text-white py-2 px-4 rounded-lg w-full"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

