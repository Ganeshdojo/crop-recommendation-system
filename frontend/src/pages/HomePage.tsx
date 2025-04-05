import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { Home } from "../components/modules/Home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#040404] text-gray-900 dark:text-gray-100">
      <Navbar />
      <Home />
    </div>
  );
}
