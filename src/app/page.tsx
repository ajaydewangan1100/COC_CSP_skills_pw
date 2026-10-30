"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 bg-clip-text text-transparent mb-4 pb-2 tracking-tight drop-shadow-sm">
          PW Skills Policy Portal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Please select the document you need to sign to proceed with your enrollment and career services.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/coc/details" className="block h-full">
            <div className="h-full bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:bg-white/90 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-indigo-100">
                <FileText className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-700 transition-colors">Code of Conduct</h2>
              <p className="text-gray-600 leading-relaxed">
                Review and sign the PW Skills Code of Conduct for your offline center enrollment.
              </p>
              <div className="mt-8 text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all bg-indigo-50/50 px-6 py-2 rounded-full border border-indigo-100 group-hover:bg-indigo-100">
                Proceed <span>→</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/csp/details" className="block h-full">
            <div className="h-full bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:bg-white/90 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:-rotate-6 transition-all duration-300 shadow-sm border border-purple-100">
                <Briefcase className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">Career Services Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Acknowledge the Career Services Policy guidelines for placement assistance and support.
              </p>
              <div className="mt-8 text-purple-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all bg-purple-50/50 px-6 py-2 rounded-full border border-purple-100 group-hover:bg-purple-100">
                Proceed <span>→</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
