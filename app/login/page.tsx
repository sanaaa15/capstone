'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import CustomButton from '../components/CustomButton';

function Login() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="flex min-h-screen bg-beige-200">
            <div className="flex flex-col items-center justify-center w-1/2 p-8">
                <Link href="/">
                    <div className="text-blue-800 font-bold text-6xl md:text-8xl font-custom-1 mb-4 lg:mb-0">
                        tailor swift
                    </div>
                </Link>
                <div className="bg-beige-200 rounded px-8 pt-6 pb-10 mb-4 w-full max-w-md">
                    <div className="bg-white rounded-full flex justify-center mb-2 py-1">
                        <CustomButton
                            className={isLogin ? 'bg-blue-800 text-white' : 'bg-white text-blue-800'}
                            onClick={() => setIsLogin(true)} href=''
                        >
                            Login
                        </CustomButton>
                        <CustomButton
                            className={!isLogin ? 'bg-blue-800 text-white' : 'bg-white text-blue-800'}
                            onClick={() => setIsLogin(false)}
                            href="/register"  // Navigate to the register page
                        >
                            Register
                        </CustomButton>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Enter your Email Address"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                type="password"
                                placeholder="Enter your Password"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center text-gray-700 text-sm font-bold">
                            <input className="mr-2 leading-tight" type="checkbox" />
                            <span className="text-sm">Remember me</span>
                        </label>
                        <Link className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/forgotpassword">
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="flex items-center justify-center">
                        <CustomButton>
                            Login
                        </CustomButton>
                    </div>
                </div>
            </div>
            <div className="relative w-full lg:w-1/3 overflow-hidden">
                <div className=" h-64 lg:h-full">
                    <img
                        src="/home-page-pattern.jpg"
                        alt="Background Design"
                        className="absolute top-0 right-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 w-full h-1/2 bg-beige-200 lg:bg-transparent"></div>
                </div>
            </div>
        </div>
    );
}

export default Login;

