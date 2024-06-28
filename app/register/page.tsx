'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import CustomButton from '../components/CustomButton';
import Image from 'next/image';

function Register() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="flex min-h-screen bg-beige">
      <div className="flex flex-col items-center justify-center w-1/2 p-8">
        <Link href="/">
          <div className="text-blue font-bold text-7xl md:text-8xl font-custom-1 mb-4 lg:mb-0">
            tailor swift
          </div>
        </Link>
        <div className="bg-beige rounded px-4 pt-6 pb-10 mb-4 w-full max-w-md">
          <div className="bg-white rounded-full flex justify-center mb-7 py-2 w-[80%] mx-auto">
            <CustomButton
              className={`px-10 py-2 rounded-full focus:outline-none focus:shadow-outline ${isLogin ? 'bg-navy text-white' : 'bg-white text-navy'} mx-2`}
              onClick={() => setIsLogin(true)}
              href="/login"
            >
              Login
            </CustomButton>
            <CustomButton
              className={`px-14 py-2 rounded-full focus:outline-none focus:shadow-outline ${!isLogin ? 'bg-navy text-white' : 'bg-white text-navy'} mx-2`}
              onClick={() => setIsLogin(false)}
              href=""
            >
              Register
            </CustomButton>
          </div>

          <div className="mb-5">
            <label className="block text-navy text-md font-medium mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="shadow appearance-none border border-navy rounded-full w-full py-4 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
              id="fullName"
              type="text"
              placeholder="Enter your Full Name"
            />
          </div>
          <div className="mb-5">
            <label className="block text-navy text-md font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow appearance-none border border-navy rounded-full w-full py-4 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your Email Address"
            />
          </div>
          <div className="mb-7">
            <label className="block text-navy text-md font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border border-navy rounded-full w-full py-4 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter your Password"
            />
          </div>
          <div className="flex items-center justify-center">
            <button className='px-20 py-3 rounded-full bg-navy text-white focus:outline-none focus:shadow-outline' style={{marginLeft: '42%'}}>
              Register
            </button>
          </div>
        </div>
      </div>
      <div className="relative w-full lg:w-1/3 overflow-hidden lg:ml-auto">
        <div className="h-64 lg:h-full">
          <Image
            src="/auth-pattern.jpg"
            alt="Background Design"
            className="object-cover"
            fill
          />
          <div className="absolute bottom-0 w-full h-1/2 bg-beige lg:bg-transparent"></div>
        </div>
      </div>
    </div>
  );
}

export default Register;
