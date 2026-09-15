"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Back to Login Link */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">Forgot Password?</h3>
              <p className="text-gray-500 text-sm mt-2">
                Enter your registered email address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 transition-all text-gray-600 placeholder:text-gray-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4182f9] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all mt-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              We have sent a password reset link to <br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-8 text-blue-600 font-bold hover:underline text-sm"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}
      </div>

   
    </div>
  );
}