import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// Components
import ProfileHeader from "../components/Profile/ProfileHeader";
import EducationCard from "../components/Profile/EducationCard";
import ExperienceCard from "../components/Profile/ExperienceCard";
import DomainSection from "../components/Profile/DomainSection";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Auth Check
    const userString = localStorage.getItem("user");
    const loggedInUserId = userString ? JSON.parse(userString).id : null;

    // --- USER STATE ---
    const [user, setUser] = useState({
        name: "", username: "", emails: [""], phones: [""], gender: "Male",
        location: "", profilePic: "https://i.pravatar.cc/200?img=12",
    });
    const [editUser, setEditUser] = useState(false);

    // --- EDUCATION STATE ---
    const [education, setEducation] = useState([]);
    const [editEdu, setEditEdu] = useState(false);

    // --- EXPERIENCE STATE ---
    const [totalExp, setTotalExp] = useState("");
    const [experiences, setExperiences] = useState([]);
    const [editExp, setEditExp] = useState(false);

    // --- DOMAINS STATE ---
    const [domains, setDomains] = useState([]);
    // State to track active domain tab (Index)
    const [activeDomainIndex, setActiveDomainIndex] = useState(0); 

    useEffect(() => {
        if (!loggedInUserId) {
            toast.error("Please login first");
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/profile/${loggedInUserId}`);
                if (res.data) {
                    const data = res.data;

                    setUser({
                        name: data.fullName || "",
                        username: data.username || "",
                        emails: data.emails?.length ? data.emails : [""],
                        phones: data.phones?.length ? data.phones : [""],
                        gender: data.gender || "Male",
                        location: data.location || "",
                        profilePic: data.profilePic || "https://i.pravatar.cc/200?img=12",
                    });

                    setEducation((data.education || []).map(item => ({
                        ...item, id: item._id || item.id || Date.now()
                    })));

                    setTotalExp(data.totalExperience || "");

                    setExperiences((data.experiences || []).map(item => ({
                        ...item, id: item._id || item.id || Date.now()
                    })));

                    const fetchedDomains = (data.domains || []).map(item => ({
                        ...item,
                        id: item.id || item._id || Date.now(),
                        sections: item.sections || { languages: [], frameworks: [], projects: [], experience: [], certifications: [] }
                    }));
                    
                    setDomains(fetchedDomains);
                    
                    // Logic: Active one domain by default if exists
                    if (fetchedDomains.length > 0) {
                        setActiveDomainIndex(0);
                    }
                }
            } catch (err) {
                console.error("Fetch error", err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [loggedInUserId]);

const handleSaveAll = async () => {
        if (!loggedInUserId) return toast.error("User not logged in");
        setSaving(true);
        
        try {
            // --- FIX: Helper to strip the temporary 'id' from arrays ---
            const sanitizeArray = (arr) => arr.map(({ id, ...rest }) => rest);

            // Deep sanitize domains to also remove 'id' from nested projects
            const sanitizedDomains = domains.map(({ id, ...domain }) => {
                const cleanedDomain = { ...domain };
                if (cleanedDomain.sections && cleanedDomain.sections.projects) {
                    cleanedDomain.sections.projects = cleanedDomain.sections.projects.map(({ id, ...proj }) => proj);
                }
                return cleanedDomain;
            });

            const payload = {
                userId: loggedInUserId,
                fullName: user.name,
                username: user.username,
                gender: user.gender,
                location: user.location,
                profilePic: user.profilePic,
                emails: user.emails,
                phones: user.phones,
                education: sanitizeArray(education),      // Cleaned
                totalExperience: totalExp,
                experiences: sanitizeArray(experiences),  // Cleaned
                domains: sanitizedDomains                 // Cleaned recursively
            };

            await axios.post("http://localhost:5000/api/profile/save", payload);
            
            toast.success("Profile saved successfully!");
            setEditUser(false);
            setEditEdu(false);
            setEditExp(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save data");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 pt-28 pb-20 px-4 md:px-8 selection:bg-blue-100">
            <div className="max-w-5xl mx-auto space-y-8">
                <Toaster position="bottom-right" />

                {/* 1. Profile Header (Handles Profile Pic) */}
                <ProfileHeader
                    user={user}
                    setUser={setUser}
                    editUser={editUser}
                    setEditUser={setEditUser}
                />

                {/* 2. Experience Section */}
                <ExperienceCard
                    experiences={experiences}
                    setExperiences={setExperiences}
                    totalExp={totalExp}
                    setTotalExp={setTotalExp}
                    edit={editExp}
                    setEdit={setEditExp}
                />

                {/* 3. Education Block */}
                <EducationCard
                    education={education}
                    setEducation={setEducation}
                    edit={editEdu}
                    setEdit={setEditEdu}
                />

                {/* 4. Domain Section (Handles Tabs) */}
                <DomainSection
                    domains={domains}
                    setDomains={setDomains}
                    activeIndex={activeDomainIndex}
                    setActiveIndex={setActiveDomainIndex}
                />

                {/* Floating Save Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : null}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}