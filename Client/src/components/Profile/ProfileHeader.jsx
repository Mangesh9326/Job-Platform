import React from "react";
import { Camera, Trash2, Edit2, Save, MapPin, Mail, Phone, User, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Dynamic List Inputs (Emails/Phones)
const DynamicInputList = ({ items, onChange, onAdd, onRemove, placeholder, icon: Icon, type = "text" }) => {
  return (
    <div className="space-y-2 w-full">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon size={14} />
            </div>
            <input
              type={type}
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder={placeholder}
            />
          </div>
          {items.length > 1 && (
            <button 
              onClick={() => onRemove(index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 pl-1"
      >
        <Plus size={12} /> Add another
      </button>
    </div>
  );
};

const ProfileHeader = ({ user, setUser, editUser, setEditUser }) => {
  
  // Handlers for Arrays
  const handleArrayChange = (field, index, value) => {
    const newArray = [...user[field]];
    newArray[index] = value;
    setUser({ ...user, [field]: newArray });
  };

  const addItem = (field) => {
    setUser({ ...user, [field]: [...user[field], ""] });
  };

  const removeItem = (field, index) => {
    const newArray = user[field].filter((_, i) => i !== index);
    setUser({ ...user, [field]: newArray });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUser({ ...user, profilePic: url });
    }
  };

  return (
    <motion.div 
      layout
      className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 z-10">
        <button 
          onClick={() => setEditUser(!editUser)} 
          className={`p-2 rounded-full transition-all ${editUser ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {editUser ? <Save size={20} /> : <Edit2 size={20} />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Avatar Section */}
        <div className="relative group mx-auto md:mx-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-50 relative">
            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            
            {/* Hidden File Input Overlay */}
            {editUser && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 w-full space-y-5">
          {editUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Full Name</label>
                <input 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="text-2xl font-bold border-b border-gray-200 focus:border-blue-500 outline-none pb-1 w-full bg-transparent"
                  placeholder="Full Name"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Username</label>
                <input 
                  value={user.username} 
                  onChange={(e) => setUser({...user, username: e.target.value})}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                  placeholder="@username"
                />
              </div>

              {/* Gender Select */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Gender</label>
                <select 
                  value={user.gender}
                  onChange={(e) => setUser({...user, gender: e.target.value})}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-Binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Location</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <MapPin size={14} className="text-gray-400" />
                  <input 
                    value={user.location} 
                    onChange={(e) => setUser({...user, location: e.target.value})}
                    className="bg-transparent w-full text-sm outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Dynamic Emails */}
              <div className="md:col-span-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Email Addresses</label>
                <DynamicInputList 
                  items={user.emails} 
                  icon={Mail} 
                  placeholder="Email"
                  onChange={(idx, val) => handleArrayChange('emails', idx, val)}
                  onAdd={() => addItem('emails')}
                  onRemove={(idx) => removeItem('emails', idx)}
                />
              </div>

              {/* Dynamic Phones */}
              <div className="md:col-span-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Phone Numbers</label>
                <DynamicInputList 
                  items={user.phones} 
                  icon={Phone} 
                  placeholder="Phone"
                  type="tel"
                  onChange={(idx, val) => handleArrayChange('phones', idx, val)}
                  onAdd={() => addItem('phones')}
                  onRemove={(idx) => removeItem('phones', idx)}
                />
              </div>
            </div>
          ) : (
            // VIEW MODE
            <div className="space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 font-medium text-lg">@{user.username}</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <MapPin size={14} className="text-red-500" /> {user.location}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <User size={14} className="text-purple-500" /> {user.gender}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  {user.emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 justify-center md:justify-start">
                      <Mail size={14} className="text-blue-500" /> {email}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {user.phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 justify-center md:justify-start">
                      <Phone size={14} className="text-green-500" /> {phone}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;