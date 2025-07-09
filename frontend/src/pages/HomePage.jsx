import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const { user } = useSelector(v => v.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-indigo-400 blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Secure Certificate Management <span className="text-indigo-300">Simplified</span>
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
                Streamline your digital certificate lifecycle with our secure, automated platform.
                Request, manage, and track certificates with enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {
                  user ? (
                    <>
                      <Link to="/request" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center">
                        Request Certificate Signing
                      </Link>
                      <Link to="/dashboard" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-colors text-center">
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/register" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center">
                        Get Started Free
                      </Link>
                      <Link to="/login" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-colors text-center">
                        Sign In
                      </Link>
                    </>
                  )
                }
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-64 h-64 rounded-xl bg-indigo-600/20 blur-2xl z-0"></div>
                <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
                  <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <div className="bg-gray-900 py-3 px-4 flex items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400 ml-4">certportal.com/dashboard</div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Certificate Dashboard</h3>
                        <div className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">Admin</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
                            <div className="flex justify-between mb-2">
                              <div className="text-white font-medium">app-{item}.example.com</div>
                              <div className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded-full">Active</div>
                            </div>
                            <div className="text-xs text-gray-400 mb-3">Expires in 85 days</div>
                            <div className="flex space-x-2">
                              <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">
                                Renew
                              </button>
                              <button className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors">
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

    </div>
  );
};

export default Homepage;