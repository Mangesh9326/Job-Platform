import React, { useState } from "react";
import { Eye, EyeOff, LogIn, User, Lock, Loader2, AlertCircle, Github, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.username || !form.password) {
      return setErrorMsg("All fields are required.");
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      if (data.token) {
        login(data.user, data.token);
      }

      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 relative">
        
        {/* Brand Logo (Top Left) */}
        {/* <div className="absolute top-8 left-6 sm:left-12 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">SmartMatch</span>
        </div> */}

        <div className="w-full max-w-md mx-auto mt-16 lg:mt-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 font-medium">
              Enter your details to access your dashboard.
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
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or continue with username</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-6 bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Username Input */}
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
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-bold text-sm">Password</label>
              </div>
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
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </a>
                </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 mt-4 rounded-xl text-white font-bold transition-all shadow-lg text-lg ${
                loading 
                  ? "bg-indigo-400 cursor-not-allowed shadow-none" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
              }`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Authenticating...</>
              ) : (
                <><LogIn size={20} /> Sign In to Account</>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm font-medium">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 transition-colors underline-offset-4 hover:underline"
            >
              Sign up for free
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
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <h3 className="text-3xl font-bold text-white leading-tight mb-6">
              "This platform completely changed how we hire. The AI matching is terrifyingly accurate and saved us hundreds of hours."
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/20">
                JD
              </div>
              <div>
                <p className="text-white font-bold text-lg">Mangesh Bandre</p>
                <p className="text-indigo-200 font-medium text-sm">Head of Talent, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;