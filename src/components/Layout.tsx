import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-900">
      {/* 1. The Header */}
      <Header />

      {/* 2. Main Content Area */}
      {/* flex-grow ensures the footer is pushed to the bottom if content is short */}
      <main className="grow">
        <Outlet /> 
      </main>

      {/* 3. The Footer */}
      <Footer />
    </div>
  );
};

export default Layout;