// src/pages/PoliticianDashboard.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Settings,
  LogOut,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Edit,
  Save,
  Edit2,
  Trash2
} from "lucide-react";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Bytes
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { fileToBytes } from "../utils/fileToBytes";
import { bytesToBase64 } from "../utils/bytesToImage";
import Discussions from "./Discussions";

const db = getFirestore(app);

export default function PoliticianDashboard() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [initiatives, setInitiatives] = useState([]);
  const [bills, setBills] = useState([]);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("initiative");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  // Edit modals
  const [showEditModal, setShowEditModal] = useState(false); // For the comprehensive edit modal
  const [showItemEdit, setShowItemEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // Profile data for the comprehensive edit modal
  const [profileData, setProfileData] = useState({
    name: '',
    party: '',
    constituency: '',
    post: '',
    booth: '',
    profileImage: null,
    initiatives: [
      { id: 1, title: '', description: '', image: null },
      { id: 2, title: '', description: '', image: null },
      { id: 3, title: '', description: '', image: null }
    ],
    milestones: [
      { id: 1, title: '', budget: '', description: '' },
      { id: 2, title: '', budget: '', description: '' },
      { id: 3, title: '', budget: '', description: '' }
    ],
    schemes: '',
    electionHistory: '',
    futurePlans: ''
  });

  // Tabs configuration - UPDATED with Initiatives and Bills tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'initiatives', label: 'Initiatives', icon: Award },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ];

  // Stats data
  const stats = [
    { label: 'Total Followers', value: '15.2K', change: '+12%', icon: Users, color: 'from-amber-400 to-orange-500' },
    { label: 'Initiatives Posted', value: initiatives.length.toString(), change: '+8', icon: Award, color: 'from-yellow-500 to-orange-500' },
    { label: 'Bills Passed', value: bills.length.toString(), change: '+3', icon: FileText, color: 'from-orange-400 to-red-500' },
    { label: 'Engagement Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'from-amber-500 to-orange-500' }
  ];


  // Load session
  useEffect(() => {
    const raw = localStorage.getItem("Pratinidhi_user");
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      setSession(user);
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        party: user.party || '',
        constituency: user.constituency || ''
      }));
    } catch {
      setSession(null);
    }
  }, []);

  // Load profile
  useEffect(() => {
    if (!session?.id) return;
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", session.id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProfile(data);
          setProfileData(prev => ({
            ...prev,
            name: data.name || '',
            party: data.party || '',
            constituency: data.constituency || '',
            post: data.post || '',
            booth: data.booth || '',
            schemes: data.schemes || '',
            electionHistory: data.electionHistory || '',
            futurePlans: data.futurePlans || ''
          }));
        }
      } catch (err) {
        console.error("loadProfile error:", err);
      }
    };
    loadProfile();
  }, [session]);

  // Subscribe to initiatives
  useEffect(() => {
    if (!session?.username) return;
    const q = query(collection(db, "initiatives"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = items.filter((x) => x.author === session?.username);
      setInitiatives(filtered);
    });
    return () => unsub();
  }, [session]);

  // Subscribe to bills
  useEffect(() => {
    if (!session?.username) return;
    const q = query(collection(db, "bills"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = items.filter((x) => x.author === session?.username);
      setBills(filtered);
    });
    return () => unsub();
  }, [session]);

  // Handlers for profile edit modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInitiativeChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      initiatives: prev.initiatives.map((item, idx) => 
        idx === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleMilestoneChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      milestones: prev.milestones.map((item, idx) => 
        idx === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleImageUpload = (e, type, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfileData(prev => ({ ...prev, profileImage: reader.result }));
        } else if (type === 'initiative') {
          handleInitiativeChange(index, 'image', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInitiative = () => {
    setProfileData(prev => ({
      ...prev,
      initiatives: [...prev.initiatives, { 
        id: Date.now(), 
        title: '', 
        description: '', 
        image: null 
      }]
    }));
  };

  const handleRemoveInitiative = (index) => {
    setProfileData(prev => ({
      ...prev,
      initiatives: prev.initiatives.filter((_, idx) => idx !== index)
    }));
  };

  /* ---------------- Helpers ---------------- */
  const uint8ToBase64 = (u8Arr) => {
    if (!u8Arr) return null;
    if (typeof u8Arr.toUint8Array === "function") {
      u8Arr = u8Arr.toUint8Array();
    }
    let u8;
    if (u8Arr instanceof ArrayBuffer) u8 = new Uint8Array(u8Arr);
    else if (u8Arr instanceof Uint8Array) u8 = u8Arr;
    else if (typeof u8Arr._byteString !== "undefined" && typeof u8Arr._byteString.binaryString === "string") {
      const binStr = u8Arr._byteString.binaryString;
      return "data:image/jpeg;base64," + btoa(binStr);
    } else {
      try {
        if (u8Arr && u8Arr.binaryString) return "data:image/jpeg;base64," + btoa(u8Arr.binaryString);
      } catch (e) {}
      return null;
    }

    let CHUNK_SZ = 0x8000;
    let index = 0;
    let base64 = "";
    while (index < u8.length) {
      const slice = u8.subarray(index, Math.min(index + CHUNK_SZ, u8.length));
      base64 += String.fromCharCode.apply(null, slice);
      index += CHUNK_SZ;
    }
    try {
      const b64 = btoa(base64);
      return "data:image/jpeg;base64," + b64;
    } catch (err) {
      console.error("uint8ToBase64 btoa failed", err);
      return null;
    }
  };

  const renderImgSrc = (item) => {
    if (!item) return null;
    if (item.image_base64) return item.image_base64;
    if (item.imageUrl) return item.imageUrl;
    if (item.image_blob) {
      try {
        if (typeof bytesToBase64 === "function") {
          const maybe = bytesToBase64(item.image_blob);
          if (maybe) return maybe;
        }
      } catch (e) {}
      const fallback = uint8ToBase64(item.image_blob);
      if (fallback) return fallback;
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("Pratinidhi_user");
    window.location.href = "/auth";
  };

  /* ---------------- Upload new Initiative/Bill ---------------- */
  const handleUpload = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (!uploadTitle.trim()) {
      setMessage("Title required");
      return;
    }

    setUploading(true);
    try {
      let image_blob = null;
      let image_base64 = null;

      if (uploadFile) {
        const raw = await fileToBytes(uploadFile);
        let u8;
        if (raw instanceof ArrayBuffer) u8 = new Uint8Array(raw);
        else if (raw instanceof Uint8Array) u8 = raw;
        else if (raw && raw.buffer && raw.byteLength) u8 = new Uint8Array(raw.buffer);
        else u8 = null;

        if (u8) {
          image_base64 = uint8ToBase64(u8);
          try {
            if (typeof Bytes.fromUint8Array === "function") {
              image_blob = Bytes.fromUint8Array(u8);
            } else if (typeof Bytes === "function") {
              image_blob = Bytes(u8);
            } else {
              image_blob = null;
            }
          } catch (e) {
            image_blob = null;
          }
        }
      }

      const col = uploadType === "initiative" ? "initiatives" : "bills";
      await addDoc(collection(db, col), {
        title: uploadTitle.trim(),
        description: uploadDesc.trim() || null,
        author: session.username,
        party: profile?.party || null,
        image_blob: image_blob || null,
        image_base64: image_base64 || null,
        created_at: serverTimestamp(),
        ...(uploadType === "bill"
          ? {
              version: 1,
              changesCount: 0,
              latestChangeSummary: "Initial bill draft published",
              updated_at: serverTimestamp(),
            }
          : {}),
      });

      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setShowUpload(false);
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Upload failed — check console");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- Save Profile (Comprehensive Modal) ---------------- */
  const handleSaveProfile = async () => {
    if (!session?.id) return;
    try {
      const docRef = doc(db, "users", session.id);
      await updateDoc(docRef, {
        name: profileData.name || "",
        party: profileData.party || null,
        constituency: profileData.constituency || null,
        post: profileData.post || null,
        booth: profileData.booth || null,
        schemes: profileData.schemes || null,
        electionHistory: profileData.electionHistory || null,
        futurePlans: profileData.futurePlans || null
      });
      setProfile(prev => ({ ...prev, ...profileData }));
      setShowEditModal(false);
    } catch (err) {
      console.error("saveProfile err:", err);
      alert("Failed to save profile");
    }
  };

  /* ---------------- Edit Item ---------------- */
  const openEditForItem = (item, type) => {
    setEditingItem({ ...item, __type: type });
    setShowItemEdit(true);
  };

  const handleSaveItemEdit = async (payload) => {
    try {
      const docRef = doc(db, payload.type === "initiative" ? "initiatives" : "bills", payload.id);
      const updateObj = {
        title: payload.title,
        description: payload.description,
      };

      if (payload.newFile) {
        const raw = await fileToBytes(payload.newFile);
        let u8;
        if (raw instanceof ArrayBuffer) u8 = new Uint8Array(raw);
        else if (raw instanceof Uint8Array) u8 = raw;
        else if (raw && raw.buffer && raw.byteLength) u8 = new Uint8Array(raw.buffer);
        else u8 = null;

        if (u8) {
          const base64 = uint8ToBase64(u8);
          updateObj.image_base64 = base64;
          try {
            if (typeof Bytes.fromUint8Array === "function") {
              updateObj.image_blob = Bytes.fromUint8Array(u8);
            } else if (typeof Bytes === "function") {
              updateObj.image_blob = Bytes(u8);
            }
          } catch (e) {}
        }
      }

      await updateDoc(docRef, updateObj);
      setShowItemEdit(false);
      setEditingItem(null);
      setSelectedItem(null);
    } catch (err) {
      console.error("handleSaveItemEdit err:", err);
      alert("Failed to save item");
    }
  };

  /* ---------------- Delete Item ---------------- */
  const promptDeleteItem = (item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const item = deletingItem;
    if (!item) return;
    try {
      const col = item.__type === "initiative" || initiatives.find(i => i.id === item.id) ? "initiatives" : "bills";
      const collectionName = item.__type ? (item.__type === "initiative" ? "initiatives" : "bills") : col;
      await deleteDoc(doc(db, collectionName, item.id));
      setSelectedItem(null);
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      setShowItemEdit(false);
      setEditingItem(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ec_100%)] text-slate-900">
        Login required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ec_100%)] text-slate-900">
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_8px_18px_rgba(245,158,11,0.2)]">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">Politician Dashboard</p>
                <h1 className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-2xl font-bold leading-none text-transparent">Pratinidhi</h1>
                <p className="mt-1 text-sm text-slate-500">Hello, {session.name || profileData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 border border-slate-200 bg-white rounded-full text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* Tabs */}
        <div className="mb-8 flex items-center gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-white px-1.5 py-1.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_8px_18px_rgba(245,158,11,0.22)]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="p-8 bg-white/92 backdrop-blur-lg rounded-3xl border border-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-start gap-6 mb-8">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-400"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{profileData.name}</h2>
                  <div className="space-y-1 text-slate-600">
                    <p><strong>Party:</strong> {profileData.party}</p>
                    <p><strong>Constituency:</strong> {profileData.constituency}</p>
                    {profileData.post && <p><strong>Post:</strong> {profileData.post}</p>}
                    {profileData.booth && <p><strong>Booth:</strong> {profileData.booth}</p>}
                  </div>
                </div>
              </div>

              {/* Initiatives Section */}
              {profileData.initiatives.some(i => i.title) && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Initiatives</h3>
                  <div className="space-y-4">
                    {profileData.initiatives.map((initiative, idx) => initiative.title && (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex gap-4">
                        {initiative.image && (
                          <img src={initiative.image} alt={initiative.title} className="w-24 h-24 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-semibold">{idx + 1}. {initiative.title}</p>
                          <p className="text-sm text-slate-500">{initiative.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones Section */}
              {profileData.milestones.some(m => m.title) && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Milestones Achieved</h3>
                  <div className="space-y-3">
                    {profileData.milestones.map((milestone, idx) => milestone.title && (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="font-semibold">{idx + 1}. {milestone.title}</p>
                        <p className="text-sm text-slate-500">Budget: ₹{milestone.budget}</p>
                        <p className="text-sm text-slate-600">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Sections */}
              {profileData.schemes && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Schemes</h3>
                  <p className="text-slate-600">{profileData.schemes}</p>
                </div>
              )}

              {profileData.electionHistory && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Election History</h3>
                  <p className="text-slate-600">{profileData.electionHistory}</p>
                </div>
              )}

              {profileData.futurePlans && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Future Plans/Roadmaps</h3>
                  <p className="text-slate-600">{profileData.futurePlans}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/92 backdrop-blur-lg rounded-3xl border border-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setUploadType("initiative"); setShowUpload(true); }}
                  className="p-6 bg-white border border-amber-100 rounded-3xl flex items-center gap-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] hover:border-amber-200 transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">Create New Initiative</p>
                    <p className="text-sm text-slate-500">Share your initiatives</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setUploadType("bill"); setShowUpload(true); }}
                  className="p-6 bg-white border border-amber-100 rounded-3xl flex items-center gap-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] hover:border-amber-200 transition-all"
                >
                  <Award className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">Add Bill</p>
                    <p className="text-sm text-slate-500">Track legislation</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-white border border-amber-100 rounded-3xl flex items-center gap-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] hover:border-amber-200 transition-all"
                >
                  <MessageSquare className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">View Messages</p>
                    <p className="text-sm text-slate-500">Respond to constituents</p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Posts</h2>
                <button className="text-amber-600 hover:text-orange-600 font-semibold">View All</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[...initiatives, ...bills].slice(0, 4).map((post) => {
                  const img = renderImgSrc(post);
                  return (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedItem({ ...post, __type: initiatives.find(i => i.id === post.id) ? "initiative" : "bill" })}
                      className="p-6 bg-white/92 backdrop-blur-lg rounded-3xl border border-white cursor-pointer shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                    >
                      {img && <img src={img} className="w-full h-40 object-cover rounded-xl mb-4" alt={post.title} />}
                      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                      <p className="text-slate-500 truncate mb-3">{post.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.created_at?.toDate ? new Date(post.created_at.toDate()).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Initiatives Tab */}
        {activeTab === 'initiatives' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Initiatives ({initiatives.length})</h2>
              <button 
                onClick={() => { setUploadType("initiative"); setShowUpload(true); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold shadow-[0_14px_32px_rgba(245,158,11,0.22)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Initiative
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((it) => (
                <motion.div 
                  key={it.id} 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/92 rounded-3xl border border-white cursor-pointer relative shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                >
                  {renderImgSrc(it) && <img src={renderImgSrc(it)} className="w-full h-40 object-cover rounded-xl mb-4" alt={it.title} />}
                  <h3 className="text-xl font-bold mb-2">{it.title}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-4">{it.description}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedItem({ ...it, __type: "initiative" }); }} 
                      className="flex-1 px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-700"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditForItem(it, "initiative"); }} 
                      className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 text-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {initiatives.length === 0 && (
              <div className="text-center py-20">
                <Award className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-bold mb-2">No Initiatives Yet</h3>
                <p className="text-slate-500 mb-6">Start by creating your first initiative</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Bills ({bills.length})</h2>
              <button 
                onClick={() => { setUploadType("bill"); setShowUpload(true); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold shadow-[0_14px_32px_rgba(245,158,11,0.22)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Bill
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bills.map((it) => (
                <motion.div 
                  key={it.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/92 rounded-3xl border border-white cursor-pointer relative shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                >
                  {renderImgSrc(it) && <img src={renderImgSrc(it)} className="w-full h-40 object-cover rounded-xl mb-4" alt={it.title} />}
                  <h3 className="text-xl font-bold mb-2">{it.title}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-4">{it.description}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedItem({ ...it, __type: "bill" }); }} 
                      className="flex-1 px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-700"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditForItem(it, "bill"); }} 
                      className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 text-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {bills.length === 0 && (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-bold mb-2">No Bills Yet</h3>
                <p className="text-slate-500 mb-6">Start by creating your first bill</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "discussions" && <Discussions key="discussions" />}

        {/* Other tabs */}
        {!['overview', 'profile', 'initiatives', 'bills'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-3xl font-bold mb-4">{tabs.find(t => t.id === activeTab)?.label} Content</h2>
            <p className="text-slate-500">This section is under development</p>
          </motion.div>
        )}
      </div>

      {/* Edit Profile Modal - COMPREHENSIVE VERSION */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-white max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 flex items-center justify-between z-10">
                <h2 className="text-3xl font-bold">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                
                {/* Profile Image */}
                <div>
                  <label className="block text-lg font-semibold mb-3">Profile Image</label>
                  <div className="flex items-center gap-6">
                    {profileData.profileImage ? (
                      <img 
                        src={profileData.profileImage} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-amber-400"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <label className="cursor-pointer px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-700 shadow-sm">
                      <Upload className="w-5 h-5" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Post</label>
                    <input
                      type="text"
                      name="post"
                      value={profileData.post}
                      onChange={handleInputChange}
                      placeholder="e.g., MLA, Minister"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Booth No.</label>
                    <input
                      type="text"
                      name="booth"
                      value={profileData.booth}
                      onChange={handleInputChange}
                      placeholder="Booth No."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Party</label>
                    <input
                      type="text"
                      name="party"
                      value={profileData.party}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Initiatives with Pictures */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Initiatives with Pictures</h3>
                    <button
                      type="button"
                      onClick={handleAddInitiative}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Initiative
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {profileData.initiatives.map((initiative, idx) => (
                      <div key={initiative.id || idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold">{idx + 1}.</p>
                          {profileData.initiatives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInitiative(idx)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Initiative title"
                            value={initiative.title}
                            onChange={(e) => handleInitiativeChange(idx, 'title', e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                          />
                          <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 justify-center text-slate-700">
                            <ImageIcon className="w-4 h-4" />
                            {initiative.image ? 'Change Image' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'initiative', idx)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        
                        {initiative.image && (
                          <img src={initiative.image} alt="Initiative" className="w-full h-32 object-cover rounded-lg mb-3" />
                        )}
                        
                        <textarea
                          placeholder="Description"
                          value={initiative.description}
                          onChange={(e) => handleInitiativeChange(idx, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Milestones Achieved (with Budget)</h3>
                  <div className="space-y-4">
                    {profileData.milestones.map((milestone, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="font-semibold mb-3">{idx + 1}.</p>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Milestone title"
                            value={milestone.title}
                            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            placeholder="Budget (₹)"
                            value={milestone.budget}
                            onChange={(e) => handleMilestoneChange(idx, 'budget', e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Fields */}
                <div>
                  <label className="block text-lg font-semibold mb-3">Schemes</label>
                  <textarea
                    name="schemes"
                    value={profileData.schemes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="List your schemes and programs..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3">Election History</label>
                  <textarea
                    name="electionHistory"
                    value={profileData.electionHistory}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Your election history and results..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3">Future Plans/Roadmaps</label>
                  <textarea
                    name="futurePlans"
                    value={profileData.futurePlans}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Your vision and future plans for the constituency..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            type={uploadType}
            title={uploadTitle}
            desc={uploadDesc}
            file={uploadFile}
            uploading={uploading}
            message={message}
            onClose={() => {
              setShowUpload(false);
              setUploadTitle("");
              setUploadDesc("");
              setUploadFile(null);
              setMessage("");
            }}
            onSubmit={handleUpload}
            onPickFile={setUploadFile}
            onChangeTitle={setUploadTitle}
            onChangeDesc={setUploadDesc}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            renderImgSrc={renderImgSrc}
            onClose={() => setSelectedItem(null)}
            onEdit={() => { openEditForItem(selectedItem, selectedItem.__type || "initiative"); }}
            onPromptDelete={() => promptDeleteItem(selectedItem)}
          />
        )}
      </AnimatePresence>

      {/* Item Edit Modal */}
      <AnimatePresence>
        {showItemEdit && editingItem && (
          <ItemEditModal
            item={editingItem}
            onClose={() => { setShowItemEdit(false); setEditingItem(null); }}
            onSave={handleSaveItemEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-2xl max-w-md w-full border border-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            >
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete "{deletingItem.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl font-semibold transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletingItem(null); }}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Modal Components ---------------- */
function UploadModal({ type, title, desc, file, uploading, message, onClose, onSubmit, onPickFile, onChangeTitle, onChangeDesc }) {
  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-white p-6 rounded-2xl max-w-lg w-full border border-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]" initial={{ y: 20 }} animate={{ y: 0 }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{type === "initiative" ? "New Initiative" : "New Bill"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><X /></button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="text-sm">Title</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 mb-3 text-slate-900 focus:outline-none focus:border-amber-400" value={title} onChange={(e) => onChangeTitle(e.target.value)} />

          <label className="text-sm">Description</label>
          <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 mb-3 text-slate-900 focus:outline-none focus:border-amber-400" value={desc} rows={4} onChange={(e) => onChangeDesc(e.target.value)} />

          <label className="text-sm">Image (optional)</label>
          <input type="file" accept="image/*" className="mb-3" onChange={(e) => onPickFile(e.target.files?.[0] || null)} />

          {file && <p className="text-sm text-slate-500">{file.name}</p>}
          {message && <p className="text-red-400 text-sm mt-1">{message}</p>}

          <div className="flex gap-3 mt-4">
            <button disabled={uploading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DetailModal({ item, renderImgSrc, onClose, onEdit, onPromptDelete }) {
  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-white p-6 rounded-2xl max-w-xl w-full border border-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <p className="text-slate-500 text-sm">{item.author} • {item.party || ""}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-slate-600"><Edit2 /></button>
            <button onClick={onPromptDelete} className="p-2 hover:bg-red-50 rounded-lg flex items-center gap-2 text-red-500"><Trash2 /></button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><X /></button>
          </div>
        </div>

        {renderImgSrc(item) && (
          <img src={renderImgSrc(item)} className="w-full h-64 object-cover rounded-xl mb-4" alt={item.title} />
        )}

        <p className="text-slate-600 mb-3">{item.description}</p>

        <p className="text-slate-400 text-xs">
          {item.created_at?.toDate ? new Date(item.created_at.toDate()).toLocaleString() : ""}
        </p>
      </motion.div>
    </motion.div>
  );
}

function ItemEditModal({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item.title || "");
  const [desc, setDesc] = useState(item.description || "");
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (newFile) {
      const url = URL.createObjectURL(newFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [newFile]);

  const handleSave = () => {
    onSave({
      id: item.id,
      type: item.__type || "initiative",
      title: title,
      description: desc,
      newFile: newFile || null
    });
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-white p-6 rounded-2xl max-w-lg w-full border border-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]" initial={{ y: 20 }} animate={{ y: 0 }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">Edit {item.__type === "bill" ? "Bill" : "Initiative"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><X /></button>
        </div>

        <div className="space-y-3">
          <label className="text-sm">Title</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-amber-400" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="text-sm">Description</label>
          <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-amber-400" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />

          <label className="text-sm">Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />

          {preview && <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-md mt-2" />}
          {!preview && item.image_base64 && <img src={item.image_base64} alt="existing" className="w-full h-40 object-cover rounded-md mt-2" />}
          {!preview && !item.image_base64 && item.image_blob && <img src={bytesToBase64(item.image_blob)} alt="existing" className="w-full h-40 object-cover rounded-md mt-2" />}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">Save</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
