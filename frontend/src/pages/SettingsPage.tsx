import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { Settings } from "../components/modules/Settings";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#040404] text-gray-900 dark:text-gray-100">
      <Navbar />
      <Settings />
    </div>
  );
}