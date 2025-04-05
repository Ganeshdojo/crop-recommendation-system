import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { Training } from "../components/modules/Training";

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#040404] text-gray-900 dark:text-gray-100">
      <Navbar />
      <Training />
    </div>
  );
}