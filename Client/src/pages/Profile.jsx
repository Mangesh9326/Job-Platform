import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import ProfileHeader from "../components/Profile/ProfileHeader";
import EducationCard from "../components/Profile/EducationCard";
import ExperienceCard from "../components/Profile/ExperienceCard";
import DomainSection from "../components/Profile/DomainSection";

export default function Profile() {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const userString = localStorage.getItem("user");
    const loggedInUserId = userString ? JSON.parse(userString).id : null;

    // --- USER STATE ---
    const [user, setUser] = useState({
        name: "",
        username: "",
        emails: [""],
        phones: [""],
        gender: "Male",
        location: "",
        profilePic: "https://i.pravatar.cc/200?img=12",
    });
    const [editUser, setEditUser] = useState(false);

    // --- EDUCATION STATE ---
    const [education, setEducation] = useState([]);
    const [editEdu, setEditEdu] = useState(false);

    // --- EXPERIENCE STATE ---
    const [totalExp, setTotalExp] = useState("");
    const [experiences, setExperiences] = useState([]);
    const [editExp, setEditExp] = useState(false);

    // --- DOMAINS STATE (Same as before) ---
    const [domains, setDomains] = useState([]);


    useEffect(() => {
        if (!loggedInUserId) {
            toast.error("Please login first");
            return;
        }

        // ... inside useEffect in Profile.jsx

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

                    // --- THE FIX: Map _id to id ---
                    setEducation((data.education || []).map(item => ({
                        ...item,
                        id: item._id || item.id || Date.now() // Use _id from DB, fallback to existing id
                    })));

                    setTotalExp(data.totalExperience || "");

                    setExperiences((data.experiences || []).map(item => ({
                        ...item,
                        id: item._id || item.id || Date.now() // Use _id from DB
                    })));

                    // Domains usually have manual IDs, but safer to check
                    setDomains((data.domains || []).map(item => ({
                        ...item,
                        id: item.id || item._id || Date.now(), // Domains usually store 'id' manually based on your schema
                        sections: item.sections || { languages: [], frameworks: [], projects: [], experience: [], certifications: [] }
                    })));
                }
            } catch (err) {
                console.error("Fetch error", err);
                // Optional: toast.error("Could not load profile data");
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
            const payload = {
                userId: loggedInUserId,
                fullName: user.name,
                username: user.username,
                gender: user.gender,
                location: user.location,
                profilePic: user.profilePic,
                emails: user.emails,
                phones: user.phones,
                education: education,
                totalExperience: totalExp,
                experiences: experiences,
                domains: domains
            };

            await axios.post("http://localhost:5000/api/profile/save", payload);
            toast.success("Profile saved successfully!");

            // Close all edit modes
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

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <Toaster position="bottom-right" />

                {/* 1. Profile Header */}
                <ProfileHeader
                    user={user}
                    setUser={setUser}
                    editUser={editUser}
                    setEditUser={setEditUser}
                />

                {/* 2. Experience Section (New) */}
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

                {/* 4. Domain Tabs & Skills */}
                <DomainSection
                    domains={domains}
                    setDomains={setDomains}
                />
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform"
                    >
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}