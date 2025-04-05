import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { About } from "../components/modules/About";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#040404] text-gray-900 dark:text-gray-100">
      <Navbar />
      <About />
    </div>
  );
} 