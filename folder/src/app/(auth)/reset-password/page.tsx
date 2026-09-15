"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Basic validation logic for the UI
  const validations = {
    length: password.length >= 8,
    number: /\d/.test(password),
    match: password === confirmPassword && password !== "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validations.length || !validations.number || !validations.match) return;

    setLoading(true);
    // Simulate API call to backend
    setTimeout(() => {
      setLoading(false);
      alert("Password reset successful! Redirecting to login...");
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800">Set New Password</h3>
          <p className="text-gray-500 text-sm mt-2">
            Enter New Password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 transition-all text-gray-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 transition-all text-gray-600"
                required
              />
            </div>
          </div>

          {/* Validation Checklist - Great for YouTube Tutorials! */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
            <div className={`flex items-center text-xs font-medium ${validations.length ? 'text-green-600' : 'text-gray-400'}`}>
              {validations.length ? <Check size={14} className="mr-2" /> : <X size={14} className="mr-2" />}
              At least 8 characters
            </div>
            <div className={`flex items-center text-xs font-medium ${validations.number ? 'text-green-600' : 'text-gray-400'}`}>
              {validations.number ? <Check size={14} className="mr-2" /> : <X size={14} className="mr-2" />}
              Contains at least one number
            </div>
            <div className={`flex items-center text-xs font-medium ${validations.match ? 'text-green-600' : 'text-gray-400'}`}>
              {validations.match ? <Check size={14} className="mr-2" /> : <X size={14} className="mr-2" />}
              Passwords match
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !validations.match}
            className="w-full bg-[#4182f9] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}