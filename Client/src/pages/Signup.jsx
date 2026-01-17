import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // FORM STATES
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  // Handle Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Signup Successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setMessage(data.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-100 via-purple-100 to-blue-100 px-4">

      <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-lg animate-fadeIn">

        <div className="text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
            alt="signup"
            className="w-24 mx-auto drop-shadow-lg animate-float"
          />
          <h2 className="text-4xl font-extrabold mt-4 text-gray-900">
            Create Account
          </h2>
          <p className="text-gray-700 mt-1 text-sm">
            Join us & start your journey today!
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">

          {/* FULL NAME */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Full Name</label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="John Doe"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="john@example.com"
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Choose a username"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Password</label>
            <div className="relative mt-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Choose a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 
            text-white font-medium rounded-xl hover:bg-blue-500 transition shadow-md 
            hover:shadow-lg"
          >
            <UserPlus size={20} />
            Sign Up
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p className="text-center mt-4 text-sm font-medium text-red-600">
            {message}
          </p>
        )}

        <p className="text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

        <div className="my-4 flex items-center gap-3">
          <div className="grow h-px bg-gray-300" />
          <span className="text-gray-600 text-sm">OR</span>
          <div className="grow h-px bg-gray-300" />
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/50 
          backdrop-blur-md border border-white/40 text-gray-800 font-medium 
          rounded-xl hover:bg-white/70 transition"
        >
          <ArrowRight size={20} />
          Back to Login
        </button>

      </div>
    </div>
  );
};

export default Signup;
