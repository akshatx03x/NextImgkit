"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password doesn't match");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration Failed");
        return;
      }

      console.log(data);
      router.push("/login");
    } catch (error) {
      console.log(error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-[#0f0f0f] via-[#1a1a1a] to-[#111] text-white px-4">
      <div className="w-full max-w-md bg-[#1e1e1e] rounded-2xl p-8 shadow-2xl border border-gray-800">
        <h1 className="text-3xl font-semibold mb-6 text-center text-white">
          Create an Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-gray-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-gray-400">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm text-gray-400">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
