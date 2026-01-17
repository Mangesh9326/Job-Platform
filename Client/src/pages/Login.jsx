import React, { useState,  useContext } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
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

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Login
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

      // Save token (Optional)
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 via-purple-100 to-pink-100 px-4">

      <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-lg animate-fadeIn">

        <div className="text-center">
          <h2 className="text-4xl font-extrabold mt-4 text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-700 mt-1 text-sm">
            Your next dream job is just one step away!
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleLogin}>

          <div>
            <label className="text-gray-700 font-medium text-sm">Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium text-sm">Password</label>
            <div className="relative mt-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-inner focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Enter your password"
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

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={20} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-purple-700 font-semibold cursor-pointer hover:underline"
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;