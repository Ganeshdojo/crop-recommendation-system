import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart2,
  Cloud,
  Droplet,
  ExternalLink,
  Leaf,
  LineChart,
  Thermometer,
} from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="py-16 md:py-24 px-4"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-4xl md:text-4xl font-bold mb-4">
                Analysis of{" "}
                <motion.span
                  className="text-green-500"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Crop Recommendations
                </motion.span>{" "}
                Based on Season Using{" "}
                <motion.span
                  className="text-green-500"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  Machine Learning Techniques
                </motion.span>
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                Make your agricultural decisions with machine learning. Get
                accurate crop recommendations based on soil conditions and
                environmental factors.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/prediction">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg">
                      Try Prediction <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/training">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300"
                    >
                      Train Model <ExternalLink className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative rounded-lg overflow-hidden h-[400px] shadow-xl transition-all duration-300 hover:shadow-2xl">
                {/* Background image */}
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3"
                  alt="Wheat field"
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Soil Analysis Card */}
                <div className="absolute top-4 right-4 p-4 bg-gray-900/80 dark:bg-[#1a1a1a] backdrop-blur-sm rounded-lg w-64 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Soil Analysis</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Nitrogen */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nitrogen (N)</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-gray-800/70 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Phosphorus */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phosphorus (P)</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-800/70 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Potassium */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Potassium (K)</span>
                        <span>80%</span>
                      </div>
                      <div className="w-full bg-gray-800/70 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="absolute bottom-8 left-8 right-8 p-5 bg-gray-900/80 dark:bg-[#1a1a1a] backdrop-blur-sm rounded-lg text-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-green-800/80 dark:bg-green-700/80 rounded-full p-2">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        Top Recommendation
                      </h4>
                      <p className="text-xs text-gray-300">
                        Based on your data
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-bold">Wheat</h2>
                    <div>
                      <span className="text-green-400 text-sm font-medium">
                        92% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4 bg-gray-50 dark:bg-[#1a1a1a]"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Features for the System
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Use machine learning to make smart farming decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white dark:bg-[#161616] rounded-lg p-6 shadow-sm transition-all duration-300 hover:border-green-500 border-2 border-transparent"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-5">
                <div className="h-6 w-6">
                  <BarChart2 />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Multiple ML Models
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from Decision Tree and XGBoost algorithms for best
                predictions.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white dark:bg-[#161616] rounded-lg p-6 shadow-sm transition-all duration-300 hover:border-green-500 border-2 border-transparent"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-5">
                <div className="h-6 w-6">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Custom Training
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Train models with your own dataset to improve prediction
                accuracy.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white dark:bg-[#161616] rounded-lg p-6 shadow-sm transition-all duration-300 hover:border-green-500 border-2 border-transparent"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-5">
                <div className="h-6 w-6">
                  <Thermometer />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Environmental Factors
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Consider rainfall, temperature, and humidity for precise
                recommendations.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white dark:bg-[#161616] rounded-lg p-6 shadow-sm transition-all duration-300 hover:border-green-500 border-2 border-transparent"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-5">
                <div className="h-6 w-6">
                  <Leaf />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Soil Factors
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Input soil parameters like NPK values and pH for precise
                recommendations.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white dark:bg-[#161616] rounded-lg p-6 shadow-sm transition-all duration-300 hover:border-green-500 border-2 border-transparent"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-5">
                <div className="h-6 w-6">
                  <Cloud />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Weather Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connects to real-time weather APIs for accurate forecasting.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-20 px-4"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
              How System Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our ML platform makes crop predictions simple and accurate.
            </p>
          </motion.div>

          <div className="relative mt-20">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-200 dark:bg-green-900/50"></div>

            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                <div className="lg:text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Step 1
                  </span>
                  <h3 className="text-2xl font-bold mt-1 mb-4 text-gray-900 dark:text-white">
                    Input Parameters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter soil composition (NPK values), environmental factors
                    (temperature, humidity, rainfall, and pH level). For
                    convenience, you can use geolocation to automatically fetch
                    weather data.
                  </p>
                </div>
                <div className="lg:order-first">
                  <div className="bg-white dark:bg-[#1a1a1a] p-2 rounded-lg shadow-sm overflow-hidden">
                    <img
                      src="/inputs.png"
                      alt="Soil Testing"
                      className="w-full h-64 object-cover rounded"
                    />
                  </div>
                </div>
                {/* Timeline Marker */}
                <div className="absolute left-1/2 top-24 transform -translate-x-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-solid border-2 border-white">
                  <Droplet className="h-5 w-5" />
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Step 2
                  </span>
                  <h3 className="text-2xl font-bold mt-1 mb-4 text-gray-900 dark:text-white">
                    Model Selection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose from multiple machine learning models like Random
                    Forest and XGBoost, each with unique strengths and
                    capabilities.
                  </p>
                </div>
                <div>
                  <div className="bg-white dark:bg-[#1a1a1a] p-2 rounded-lg shadow-sm overflow-hidden">
                    <img
                      src="/model-selection.png"
                      alt="AI Model Selection"
                      className="w-full h-64 object-cover rounded"
                    />
                  </div>
                </div>
                {/* Timeline Marker */}
                <div className="absolute left-1/2 top-24 transform -translate-x-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-solid border-2 border-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                <div className="lg:text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Step 3
                  </span>
                  <h3 className="text-2xl font-bold mt-1 mb-4 text-gray-900 dark:text-white">
                    Process Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our ML algorithms analyze your inputs against current
                    conditions to make intelligent predictions based on
                    patterns.
                  </p>
                </div>
                <div className="lg:order-first">
                  <div className="bg-white dark:bg-[#1a1a1a] p-2 rounded-lg shadow-sm overflow-hidden">
                    <img
                      src="/process-data.png"
                      alt="Data Processing"
                      className="w-full h-64 object-cover rounded"
                    />
                  </div>
                </div>
                {/* Timeline Marker */}
                <div className="absolute left-1/2 top-24 transform -translate-x-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-solid border-2 border-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Step 4
                  </span>
                  <h3 className="text-2xl font-bold mt-1 mb-4 text-gray-900 dark:text-white">
                    Get Predictions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Receive accurate crop recommendations along with matching
                    scores, specific guidelines, and suggestions tailored to your specific conditions.
                  </p>
                </div>
                <div>
                  <div className="bg-white dark:bg-[#1a1a1a] p-2 rounded-lg shadow-sm overflow-hidden">
                    <img
                      src="/results.png"
                      alt="Crop Predictions"
                      className="w-full h-64 object-cover rounded"
                    />
                  </div>
                </div>
                {/* Timeline Marker */}
                <div className="absolute left-1/2 top-24 transform -translate-x-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-solid border-2 border-white">
                  <BarChart2 className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 px-4 bg-gray-50 dark:bg-[#1a1a1a]"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 dark:text-gray-300 mb-10"
          >
            Start making data-driven decisions for your agriculture needs today
            with our ML-powered platform.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/prediction">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg">
                  Try Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/training">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300"
                >
                  Train Model <ExternalLink className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-white dark:bg-black text-gray-600 dark:text-gray-400 py-12 px-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <Link to="/" className="inline-block mb-4">
                <div className="flex items-center">
                  <span className="text-gray-900 dark:text-white font-bold text-xl">
                    Crop{" "}
                  </span>
                  <span className="text-green-500 font-bold text-xl">
                    {" "}
                    Recommendation
                  </span>
                </div>
              </Link>
              <p className="text-sm">
                Making agriculture smarter with ML-based predictions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/prediction" className="hover:text-green-500">
                    Crop Prediction
                  </Link>
                </li>
                <li>
                  <Link to="/training" className="hover:text-green-500">
                    Model Training
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-green-500">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
