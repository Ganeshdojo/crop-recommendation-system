import { motion } from "framer-motion";
import { Users, Leaf, Database, ExternalLink } from "lucide-react";

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

const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

interface TeamMemberProps {
  name: string;
  rollNumber: string;
  index: number;
}

const TeamMember = ({ name, rollNumber, index }: TeamMemberProps) => (
  <motion.div
    variants={cardHover}
    initial="rest"
    whileHover="hover"
    className="bg-white dark:bg-[#171717] p-4 rounded-lg flex items-center gap-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="relative">
      <div className="bg-green-500/10 dark:bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
        <span className="text-green-600 dark:text-green-500 font-medium">
          0{index + 1}
        </span>
      </div>
    </div>
    <div>
      <h3 className="font-medium text-gray-900 dark:text-gray-200">{name}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{rollNumber}</p>
    </div>
  </motion.div>
);

export const About = () => {
  const teamMembers = [
    { name: "P GANESH", rollNumber: "218P1A0524" },
    { name: "M HARSHA VARDHAN REDDY", rollNumber: "218P1A0533" },
    { name: "P KIRAN KUMAR REDDY", rollNumber: "218P1A0544" },
    { name: "M MOHAN", rollNumber: "218P1A0563" },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white max-w-[80%] mx-auto mt-10 mb-10"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-[#1b2e22] dark:via-[#1f3a2a] dark:to-[#1b2e22] rounded-b-lg shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-4 mb-6"
          >
            <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analysis Of Crop Recommendations Based On Season Using Machine
              Learning Techniques
            </h1>
          </motion.div>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 dark:text-gray-400 text-lg"
          >
            ML-Based Crop Prediction System
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Guide Section */}
        <motion.div
          variants={fadeInUp}
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-2xl font-semibold mb-8 uppercase tracking-wider text-gray-900 dark:text-white">
            UNDER THE GUIDANCE OF
          </h2>
          <motion.div
            className="bg-white dark:bg-[#171717] p-8 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg max-w-xl mx-auto relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50"></div>
            <div className="flex items-center gap-8 relative">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold text-white shadow-lg transform hover:rotate-3 transition-transform duration-200">
                S
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Dr. R Md. Shafi
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
                  Professor & HOD
                </p>
                <p className="text-green-600 dark:text-green-500 font-medium">
                  Department of AIDS
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={fadeInUp} className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white dark:bg-[#171717] p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <Users className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Batch Number: 02
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMember
                key={member.rollNumber}
                name={member.name}
                rollNumber={member.rollNumber}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Dataset Source */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#171717] p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded-lg">
                <Database className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dataset Source
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Kaggle</p>
              </div>
            </div>
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2 font-medium"
            >
              View Dataset
              <ExternalLink className="w-4 h-4" />
            </motion.button> */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
