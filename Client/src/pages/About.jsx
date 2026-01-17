import React, { useRef, useEffect, useState } from "react";
import {
  motion, useScroll, useTransform, useInView,
  useSpring, useMotionValue, useMotionTemplate, animate
} from "framer-motion";
import {
  Target, Users, Zap, ShieldCheck,
  ArrowRight, Globe, Award, Rocket, Cpu
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- 1. COMPONENT: COUNT UP NUMBER ---
const CountUp = ({ value, suffix = "", prefix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Parse numeric part (e.g., "12.5" from "12.5k+")
  const numericValue = parseFloat(value.replace(/,/g, ""));
  const decimals = value.toString().split(".")[1]?.length || 0;

  useEffect(() => {
    if (isInView) {
      const node = ref.current;
      const controls = animate(0, numericValue, {
        duration: 2.5,
        ease: "circOut",
        onUpdate: (v) => {
          node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, numericValue, decimals, prefix, suffix]);

  return <span ref={ref}>0</span>;
};

// --- 2. COMPONENT: SCROLLING MARQUEE (Overlap Effect) ---
const ScrollVelocityText = ({ children, baseVelocity = 100, scrollContainerRef }) => {
  const { scrollY } = useScroll({ target: scrollContainerRef });
  const scrollVelocity = useSpring(scrollY, { damping: 50, stiffness: 400 });
  const x = useTransform(scrollY, (v) => `${(v * baseVelocity) / 500}%`);

  return (
    <div className="overflow-hidden whitespace-nowrap pointer-events-none select-none absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 opacity-[0.03]">
      <motion.div style={{ x }} className="text-[20rem] font-black uppercase text-white leading-none tracking-tighter whitespace-nowrap">
        {children}
      </motion.div>
    </div>
  );
};

// --- 3. COMPONENT: MOUSE PARALLAX HERO ---
const MouseParallaxHero = ({ children }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden perspective-1000"
    >
      {children(mouseX, mouseY)}
    </div>
  );
};

// --- 4. COMPONENT: STAT CARD ---
const StatCard = ({ label, value, suffix, delay }) => {
  return (
    <div className="text-center relative group p-6 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className="relative text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400 mb-2"
      >
        <CountUp value={value} suffix={suffix} />
      </div>
      <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">{label}</p>
    </div>
  );
};

const ValueCard = ({ icon: Icon, title, desc }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-8 bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-bl-full -mr-10 -mt-10 blur-xl transition-transform group-hover:scale-150" />
      <div className="relative z-10">
        <div className="w-14 h-14 bg-gray-950 rounded-2xl border border-white/10 flex items-center justify-center text-blue-400 mb-6 group-hover:rotate-12 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 shadow-lg">
          <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">{desc}</p>
      </div>
    </motion.div>
  );
};

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 overflow-hidden selection:bg-blue-500/30">

      {/* --- HERO SECTION (3D Mouse Parallax) --- */}
      <MouseParallaxHero>
        {(mouseX, mouseY) => {
          // Calculate transforms based on mouse position
          const moveX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
          const moveY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);
          const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
          const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
          const combinedY = useMotionTemplate`calc(${yHero}px + ${moveY}px)`;

          return (
            <>
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

              {/* Floating Blobs (Move opposite to mouse) */}
              <motion.div
                style={{ x: useTransform(mouseX, [-0.5, 0.5], [-40, 40]), y: useTransform(mouseY, [-0.5, 0.5], [-40, 40]) }}
                className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
              />
              <motion.div
                style={{ x: useTransform(mouseX, [-0.5, 0.5], [40, -40]), y: useTransform(mouseY, [-0.5, 0.5], [40, -40]) }}
                className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
              />

              {/* 3D Text Container */}
              <motion.div
                style={{
                  y: combinedY,
                  opacity: opacityHero,
                  rotateX,
                  rotateY,
                  x: moveX,
                  perspective: 1000
                }}
                className="relative z-10 text-center px-6 max-w-5xl"
              >
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-950/50 border border-blue-500/30 backdrop-blur-md">
                  <Cpu size={14} className="text-blue-400 animate-pulse" />
                  <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Next Gen Hiring</span>
                </div>

                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-6 leading-[0.85] drop-shadow-2xl">
                  BEYOND <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500">
                    THE RESUME
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light mt-8">
                  We use <span className="text-blue-400 font-semibold">AI Vectorization</span> to decode your true potential, matching you with careers based on skills, not just keywords.
                </p>
              </motion.div>
            </>
          );
        }}
      </MouseParallaxHero>

      {/* --- STATS SECTION (With CountUp Animation) --- */}
      <section className="py-20 relative bg-gray-950 border-y border-white/5">
        {/* Background overlapping text */}
        <ScrollVelocityText baseVelocity={-2}>
          12,000 RESUMES PARSED • 85,000 MATCHES FOUND •
        </ScrollVelocityText>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <StatCard label="Resumes Parsed" value="12" suffix="k+" delay={0} />
          <StatCard label="Career Matches" value="85" suffix="k+" delay={0.1} />
          <StatCard label="Hiring Partners" value="500" suffix="+" delay={0.2} />
          <StatCard label="AI Accuracy" value="99" suffix="%" delay={0.3} />
        </div>
      </section>

      {/* --- MISSION SECTION (Scroll Overlap) --- */}
      <section className="py-40 px-6 relative overflow-hidden">
        {/* Another overlapping text layer moving opposite direction */}
        <div className="absolute top-1/4 opacity-[0.05] pointer-events-none w-full">
          <ScrollVelocityText baseVelocity={2}>
            NO MORE BIAS • SKILL BASED HIRING • FUTURE READY •
          </ScrollVelocityText>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1 space-y-8"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              The Hiring System <br />
              <span className="text-gray-600">Was Broken.</span>
            </h2>
            <div className="h-1.5 w-24 bg-linear-to-r from-blue-600 to-purple-600 rounded-full" />
            <p className="text-lg text-gray-400 leading-relaxed">
              75% of qualified candidates are rejected by Applicant Tracking Systems (ATS) because of formatting errors or missing keywords. We fixed that.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              By using <strong className="text-white">Semantic Matching</strong>, we understand that "Client Relations" and "Account Management" are related skills. We ensure you are seen for what you can do.
            </p>

            <button
              onClick={() => navigate('/upload')}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] mt-6"
            >
              <span className="mr-2">Analyze My Potential</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1.5 }}
            className="flex-1 relative"
          >
            {/* 3D Glass Card Stack */}
            <div className="relative z-20 bg-gray-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                alt="AI Analysis"
                className="rounded-2xl w-full h-64 object-cover opacity-90"
              />
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <ShieldCheck />
                </div>
                <div>
                  <h4 className="text-white font-bold">Bias Eliminated</h4>
                  <p className="text-gray-500 text-sm">Demographic data masked automatically.</p>
                </div>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/20 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* --- VALUES GRID --- */}
      <section className="py-32 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">Engineered for Trust.</h2>
            <p className="text-gray-400 text-lg">We combine cutting-edge AI transparency with a human-first approach.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard icon={Target} title="Semantic Matching" desc="We map 50+ data points to ensure the job fits your actual skills, not just your keywords." />
            <ValueCard icon={ShieldCheck} title="Encrypted Privacy" desc="Your data is AES-256 encrypted. We are GDPR compliant and never sell your history." />
            <ValueCard icon={Zap} title="Real-Time Scoring" desc="Instant feedback loops help you improve your resume score before you even apply." />
            <ValueCard icon={Users} title="Bias Elimination" desc="Our AI blinds demographic data to ensure you are hired strictly for your capability." />
            <ValueCard icon={Globe} title="Global Protocol" desc="Whether remote or relocation, we normalize job markets to connect you globally." />
            <ValueCard icon={Award} title="Growth Insights" desc="We identify skill gaps and recommend certifications to boost your salary potential." />
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER (Magnetic) --- */}
      <section className="py-40 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
            READY TO <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              ASCEND?
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/upload')}
              className="px-12 py-6 bg-white text-gray-900 rounded-full font-bold text-xl shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.6)] transition-all"
            >
              Start Analysis
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/jobs')}
              className="px-12 py-6 bg-transparent border border-gray-700 text-white rounded-full font-bold text-xl hover:bg-gray-800 hover:border-gray-500 transition-all"
            >
              Explore Jobs
            </motion.button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;