'use client';

import Link from 'next/link';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      </div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className='px-8 py-2 rounded-full font-bold bg-blue text-white focus:outline-none focus:shadow-outline' type="submit">Login</button>
      </form>
    </div>
  );
}