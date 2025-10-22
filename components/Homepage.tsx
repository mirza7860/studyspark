import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Bot,
  Download,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Twitter,
  Github,
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";

export  function HomePage() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" },
    }),
  };

  const features = [
    {
      title: "Generate Flashcards",
      desc: "Turn concepts into Flashcards to reinforce learning.",
      icon: <Camera className="text-blue-500 w-6 h-6" />,
    },
    {
      title: "Smart Chatbot",
      desc: "Ask questions about your upload and get precise answers.",
      icon: <Bot className="text-indigo-500 w-6 h-6" />,
    },
    {
      title: "Export Offline",
      desc: "Save PDFs, flashcards, and quiz bundles for study anywhere.",
      icon: <Download className="text-purple-500 w-6 h-6" />,
    },
    {
      title: "Practice & Quizzes",
      desc: "Auto-generated quizzes and spaced-repetition flashcards.",
      icon: <HelpCircle className="text-cyan-500 w-6 h-6" />,
    },
    {
      title: "Lesson Plans",
      desc: "Auto-structured lesson outlines for any topic you provide.",
      icon: <BookOpen className="text-blue-500 w-6 h-6" />,
    },
    {
      title: "Personalized Learning",
      desc: "AI adjusts difficulty and recommendations based on progress.",
      icon: <GraduationCap className="text-indigo-500 w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 antialiased">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                StudySpark
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-slate-600 hover:text-slate-900 transition"
              >
                Features
              </a>
              <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with CLEARLY VISIBLE Grid */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          background: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px),
            linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)
          `,
          backgroundSize: "80px 80px, 80px 80px, 100% 100%",
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>

        {/* Mouse spotlight effect */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            left: mousePos.x - 192,
            top: mousePos.y - 192,
          }}
        ></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
          >
            Unlock Your Learning
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Potential
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
          >
            Transform the way you study with AI-powered tutoring. Upload
            materials, get instant answers, and master any topic effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300">
              <span className="flex items-center justify-center gap-2">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              Explore Features
            </a>
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                Powerful Learning Tools
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need to study smarter, not harder
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        ></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of students achieving their academic goals with
              StudySpark
            </p>
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              Get Started Now
              <Sparkles className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">StudySpark</span>
            </div>

            <div className="text-center md:text-left">
              <p className="text-sm">© 2025 StudySpark. All rights reserved.</p>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
