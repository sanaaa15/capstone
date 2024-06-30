'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CustomButton from '../components/CustomButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);  // Store the token
      router.push('/');
    } else {
      alert('Login failed');
    }
  };

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
              className={`px-14 py-2 rounded-full focus:outline-none focus:shadow-outline ${isLogin ? 'bg-navy text-white' : 'bg-white text-navy'} mx-2`}
              onClick={() => setIsLogin(true)}
              href="/login"
            >
              Login
            </CustomButton>
            <CustomButton
              className={`px-10 py-2 rounded-full focus:outline-none focus:shadow-outline ${!isLogin ? 'bg-navy text-white' : 'bg-white text-navy'} mx-2`}
              onClick={() => setIsLogin(false)}
              href="/register"
            >
              Register
            </CustomButton>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-navy text-md font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="shadow appearance-none border border-navy rounded-full w-full py-4 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Enter your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-7">
              <label className="block text-navy text-md font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border border-navy rounded-full w-full py-4 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-gray-700 text-sm font-bold">
                <input className="mr-2 leading-tight" type="checkbox" />
                <span className="text-sm">Remember me</span>
              </label>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue" href="/forgotpassword">
                Forgot Password?
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <button className="px-20 py-3 my-5 rounded-full bg-navy text-white focus:outline-none focus:shadow-outline" onClick={handleSubmit} type="submit" style={{marginLeft: '50%'}}>
                Login
              </button>
            </div>
          </form>
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