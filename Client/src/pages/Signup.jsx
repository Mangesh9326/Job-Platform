import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, User, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Github, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  
  // FORM STATES
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "" // NEW: Added confirm password state
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Check for empty fields
    if (!form.fullName || !form.email || !form.username || !form.password || !form.confirmPassword) {
      return setErrorMsg("All fields are required.");
    }

    // 2. Validate passwords match
    if (form.password !== form.confirmPassword) {
      return setErrorMsg("Passwords do not match. Please try again.");
    }

    // 3. Remove confirmPassword from the payload before sending to backend
    const { confirmPassword, ...signupData } = form;

    try {
      setLoading(true);

      const res = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData), // Send the cleaned data
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrorMsg(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setErrorMsg("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex bg-white font-sans">
      
      {/* ========================================== */}
      {/* LEFT COLUMN: FORM SECTION                  */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 relative py-12 lg:py-0">
        
        {/* Brand Logo (Top Left) */}
        {/* <div className="absolute top-8 left-6 sm:left-12 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">SmartMatch</span>
        </div> */}

        <div className="w-full max-w-md mx-auto mt-12 lg:mt-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Create an account
            </h2>
            <p className="text-gray-500 font-medium">
              Join thousands of professionals landing their dream jobs.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-all active:scale-95 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-all active:scale-95 shadow-sm">
              <Github size={20} />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink-0 mx-4 text-gray-400 text-sm font-medium">Or register with email</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          {/* Alert Boxes */}
          {errorMsg && (
            <div className="mb-6 bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-green-50/80 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{successMsg}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* ROW 1: Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-bold text-sm">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-bold text-sm">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none placeholder:text-gray-400"
                    placeholder="johndoe123"
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: Email */}
            <div className="space-y-1.5">
              <label className="block text-gray-700 font-bold text-sm">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none placeholder:text-gray-400"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* ROW 3: Passwords */}
            <div className="grid grid-cols-1 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-bold text-sm">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none placeholder:text-gray-400"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-bold text-sm">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none placeholder:text-gray-400"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 mt-6 rounded-xl text-white font-bold transition-all shadow-lg text-lg ${
                loading 
                  ? "bg-indigo-400 cursor-not-allowed shadow-none" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
              }`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Creating account...</>
              ) : (
                <><UserPlus size={20} /> Sign Up Free</>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm font-medium">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT COLUMN: BRANDING PANEL (HIDDEN ON MOBILE) */}
      {/* ========================================== */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] relative overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-bold mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              Over 10,000+ users joined this month
            </div>
            <h3 className="text-4xl font-black text-white leading-tight mb-6">
              Stop guessing. Start matching with your ideal tech role.
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-100 font-medium">
                <div className="bg-indigo-500/30 p-1.5 rounded-full"><CheckCircle2 size={18} className="text-indigo-300" /></div>
                AI-powered ATS scoring & resume analysis
              </div>
              <div className="flex items-center gap-3 text-indigo-100 font-medium">
                <div className="bg-indigo-500/30 p-1.5 rounded-full"><CheckCircle2 size={18} className="text-indigo-300" /></div>
                Real-time market value & salary estimation
              </div>
              <div className="flex items-center gap-3 text-indigo-100 font-medium">
                <div className="bg-indigo-500/30 p-1.5 rounded-full"><CheckCircle2 size={18} className="text-indigo-300" /></div>
                Direct matching with verified recruiters
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Signup;