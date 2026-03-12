import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
const Home = lazy(() => import("./pages/Home"));
const Upload = lazy(() => import("./pages/Upload"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Jobs = lazy(() => import("./pages/Jobs"));
const About = lazy(() => import("./pages/About"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const SaveJob = lazy(() => import("./pages/SaveJob"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const ResumeMarketAnalyzer = lazy(() => import("./pages/ResumeMarketAnalyzer"));


const PageLoader = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-400 font-medium animate-pulse tracking-wide">
      Loading ...
    </p>
  </div>
);

const Layout = () => {
  const location = useLocation();
  
  const hideFooter = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-900">
        {/* Wrap all routes in Suspense */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload-resume" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/find-jobs" element={<Jobs />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved-jobs" element={<SaveJob />} />
            <Route path="/recruiter-feature" element={<RecruiterDashboard />} />
            <Route path="/market-value" element={<ResumeMarketAnalyzer />} />
          </Routes>
        </Suspense>
      </div>
      
      {!hideFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop /> 
      <Layout />
    </Router>
  );
}

export default App;