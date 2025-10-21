import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoIcon } from "./icons/LogoIcon";

export const HomePage = () => {
  useEffect(() => {
    // enable smooth scrolling for in-page links
    document.documentElement.style.scrollBehavior = "smooth";

    // intersection observer to reveal elements on scroll
    const els = document.querySelectorAll("[data-animate]");
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // add classes to trigger Tailwind transitions
            entry.target.classList.add("opacity-100", "translate-y-0");
            // stop observing once shown
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-700 antialiased">
      {/* NAV */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                  <LogoIcon />
                </div>
                <div className="text-lg font-semibold">StudySpark</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">
                Home
              </a>
              <a href="#features" className="hover:text-slate-900">
                Features
              </a>
              <a href="#how" className="hover:text-slate-900">
                How it Works
              </a>
              <a href="#testimonials" className="hover:text-slate-900">
                Testimonials
              </a>
              <a href="#contact" className="hover:text-slate-900">
                Contact
              </a>
              <button className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm shadow hover:bg-blue-700">
                Get Started
              </button>
            </nav>

            <div className="md:hidden">
              <button
                aria-label="open menu"
                className="p-2 rounded-md bg-gray-100"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO - centered text only (image removed) */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-xl mt-10 overflow-hidden flex items-center justify-center py-16 px-8 md:px-20">
            <div className="w-full text-center">
              <h1
                className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-600"
                data-animate=""
              >
                Unlock Your Learning
                <br />
                Potential with <span className="text-blue-400">StudySpark</span>
              </h1>
              <p
                className="mt-4 text-gray-600 max-w-3xl mx-auto"
                data-animate=""
              >
                Experience personalized learning with our AI-powered tutor.
                Upload documents or videos, ask questions, and master any
                subject.
              </p>

              <div className="mt-8" data-animate="">
                <Link
                  to={"/dashboard"}
                  className="inline-block px-6 py-3 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transform transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start Learning Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 lg:px-8 mt-20">
        <div className="text-center">
          <h2
            className="text-2xl font-extrabold text-blue-600 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            Key Features
          </h2>
          <p
            className="mt-3 text-sm text-slate-500 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            StudySpark offers a comprehensive suite of tools to enhance your
            learning experience.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: "Doc & Video Upload",
              sub: "Easily upload your study materials in various formats.",
            },
            {
              title: "Interactive Q&A",
              sub: "Get instant answers and explanations to your questions.",
            },
            {
              title: "Dynamic Quizzes",
              sub: "Test your knowledge with customized quizzes.",
            },
            {
              title: "Smart Flashcards",
              sub: "Reinforce learning with AI-generated flashcards.",
            },
            {
              title: "Concise Summaries",
              sub: "Quickly grasp key concepts with automated summaries.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl shadow-sm text-center opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
              data-animate
            >
              <div className="w-12 h-12 mx-auto rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                {/* icon placeholder */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M4 12h10M4 18h16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h4 className="mt-4 font-semibold text-sm">{f.title}</h4>
              <p className="mt-2 text-xs text-slate-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - reveal on scroll */}
      <section id="how" className="max-w-6xl mx-auto px-6 lg:px-8 mt-20">
        <div className="text-center">
          <h2
            className="text-3xl font-extrabold text-blue-600 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            How It Works
          </h2>
          <p
            className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            Getting started with StudySpark is simple and intuitive. Follow
            these three easy steps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Upload Your Materials",
              desc: "Add documents, paste text, or link to a video you want to study.",
              num: 1,
            },
            {
              title: "AI-Powered Interaction",
              desc: "Our AI analyzes your content and prepares to answer questions, generate quizzes, and more.",
              num: 2,
            },
            {
              title: "Start Learning",
              desc: "Engage with your personalized tutor to master the subject matter effortlessly.",
              num: 3,
            },
          ].map((s) => (
            <div
              key={s.num}
              className="flex flex-col items-center text-center p-6 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
              data-animate
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                {s.num}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="max-w-6xl mx-auto px-6 lg:px-8 mt-20"
      >
        <div className="text-center">
          <h2
            className="text-2xl font-extrabold text-blue-600 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            Loved by Students and Educators
          </h2>
          <p
            className="mt-3 text-sm text-slate-500 opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
            data-animate
          >
            Don't just take our word for it. Here's what people are saying about
            StudySpark.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah L., University Student",
              role: "Beta Tester",
              quote:
                "StudySpark was a game-changer during my finals. The ability to upload lecture notes and get instant clarification on complex topics was incredible.",
            },
            {
              name: "Dr. Mark R., Professor",
              role: "College Fellow",
              quote:
                "An impressive application of AI in education. StudySpark has the potential to become an invaluable tool for students everywhere.",
            },
            {
              name: "Alex C., High School Student",
              role: "Early Adopter",
              quote:
                "I used StudySpark to prepare for my history exams. The quizzes and flashcards made studying engaging and effective.",
            },
          ].map((t, i) => (
            <figure
              key={i}
              className="p-6 bg-white rounded-xl shadow-sm opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
              data-animate
            >
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  👤
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-blue-500">{t.role}</div>
                </div>
              </figcaption>
              <blockquote className="mt-4 text-sm text-slate-600">
                “{t.quote}”
              </blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section
        id="contact"
        className="max-w-4xl mx-auto px-6 lg:px-8 mt-20 mb-20"
      >
        <div
          className="bg-white p-8 rounded-xl shadow-md opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out"
          data-animate
        >
          <h3 className="text-xl font-extrabold text-blue-600 text-center">
            Ready to Transform Your Studies?
          </h3>
          <p className="mt-2 text-sm text-slate-500 text-center">
            Join the StudySpark community and start your journey towards smarter
            learning today. If you have any questions, feel free to reach out.
          </p>

          <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="col-span-1 md:col-span-1 rounded-md border border-slate-200 px-4 py-2 text-sm"
              placeholder="Your Name"
            />
            <input
              className="col-span-1 md:col-span-1 rounded-md border border-slate-200 px-4 py-2 text-sm"
              placeholder="Your Email"
            />
            <textarea
              className="col-span-1 md:col-span-2 rounded-md border border-slate-200 px-4 py-2 text-sm h-28"
              placeholder="Your Message"
            />
            <div className="col-span-1 md:col-span-2 flex justify-center">
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Contact Us
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2025 StudySpark. A Hackathon Project.</div>
          <div className="flex items-center gap-6 mt-3 md:mt-0">
            <a href="#" className="hover:text-slate-700">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-700">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
