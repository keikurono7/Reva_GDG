import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../services/firebase_";

const db = getFirestore(app);

export default function AuthPage() {
  const [userType, setUserType] = useState(null); // 'politician' or 'citizen'
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    constituency: "",
    party: "",
    district: "",
  });

  const handleInputChange = (e) => {
    setMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔍 Check user exists
  async function checkIfUserExists(identifier) {
    const users = collection(db, "users");

    // Check by email
    let q = query(users, where("email", "==", identifier));
    let snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0];

    // Check by username
    q = query(users, where("username", "==", identifier));
    snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0];

    return null;
  }

  // 🟡 SIGNUP FLOW
  async function handleSignup() {
    const {
      username,
      email,
      password,
      name,
      phone,
      constituency,
      party,
      district,
    } = formData;

    if (!username || !email || !password || !name) {
      setMessage("Fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Check if email/username already exists
      const exists = await checkIfUserExists(email) || await checkIfUserExists(username);
      if (exists) {
        setMessage("Username or email already registered.");
        setLoading(false);
        return;
      }

      const users = collection(db, "users");

      const payload = {
        username,
        email,
        password, // RAW PASSWORD (you requested this)
        name,
        phone,
        constituency: userType === "politician" ? constituency : null,
        party: userType === "politician" ? party : null,
        district: userType === "citizen" ? district : null,
        userType,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(users, payload);

      // Save session to localStorage
      localStorage.setItem(
        "Pratinidhi_user",
        JSON.stringify({
          id: docRef.id,
          username,
          userType,
          name,
        })
      );

      // Redirect
      navigate(userType === "politician" ? "/politician-dashboard" : "/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  // 🔵 LOGIN FLOW
  async function handleLogin() {
    const { email, username, password } = formData;

    const identifier = email || username;

    if (!identifier || !password) {
      setMessage("Enter username/email AND password.");
      return;
    }

    setLoading(true);

    try {
      const userDoc = await checkIfUserExists(identifier);

      if (!userDoc) {
        setMessage("User not found.");
        setLoading(false);
        return;
      }

      const data = userDoc.data();

      if (data.password !== password) {
        setMessage("Incorrect password.");
        setLoading(false);
        return;
      }

      // Save session
      localStorage.setItem(
        "Pratinidhi_user",
        JSON.stringify({
          id: userDoc.id,
          username: data.username,
          userType: data.userType,
          name: data.name,
        })
      );

      // Redirect
      navigate(data.userType === "politician" ? "/politician-dashboard" : "/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "signup") handleSignup();
    else handleLogin();
  };

  // 🔶 USER TYPE SELECTION SCREEN
  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_26%),linear-gradient(180deg,#fffdf9_0%,#fff8f2_58%,#f6efe7_100%)] p-6 text-slate-900">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-bold text-center mb-12">
            Join{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Pratinidhi
            </span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Politician */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => setUserType("politician")}
              className="cursor-pointer rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-3">Politician</h2>
              <p className="mb-4 text-center text-slate-600">
                Manage profile, post initiatives & interact with citizens.
              </p>
            </motion.div>

            {/* Citizen */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => setUserType("citizen")}
              className="cursor-pointer rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-3">Citizen</h2>
              <p className="mb-4 text-center text-slate-600">
                Follow government updates, discussions & bills.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 🔷 AUTH FORM (LOGIN / SIGNUP)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_26%),linear-gradient(180deg,#fffdf9_0%,#fff8f2_58%,#f6efe7_100%)] p-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              userType === "politician"
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-slate-900"
            }`}
          >
            {userType === "politician" ? <User size={40} className="text-white" /> : <Users size={40} className="text-white" />}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500">
            {userType === "politician" ? "Politician Portal" : "Citizen Portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username only for signup */}
          {mode === "signup" && (
            <div>
              <label className="text-sm mb-1 block">Username</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                placeholder="Choose a username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === "signup" && (
            <>
              {/* Name */}
              <div>
                <label className="text-sm mb-1 block">Full Name</label>
                <input
                  name="name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm mb-1 block">Phone Number</label>
                <input
                  name="phone"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Politician fields */}
              {userType === "politician" && (
                <>
                  <div>
                    <label className="text-sm mb-1 block">Constituency</label>
                    <input
                      name="constituency"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                      placeholder="Your constituency"
                      value={formData.constituency}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-1 block">Political Party</label>
                    <input
                      name="party"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                      placeholder="Your party"
                      value={formData.party}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Citizen fields */}
              {userType === "citizen" && (
                <div>
                  <label className="text-sm mb-1 block">District</label>
                  <input
                    name="district"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition focus:border-amber-300 focus:bg-white"
                    placeholder="Your district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            disabled={loading}
            className={`w-full py-3 mt-2 rounded-xl font-semibold transition-all ${
              userType === "politician"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_16px_40px_rgba(245,158,11,0.22)]"
                : "bg-slate-900 text-white"
            }`}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {/* Error Message */}
          {message && (
            <p className="text-red-400 text-center pt-2">{message}</p>
          )}
        </form>

        {/* Toggle Login <-> Signup */}
        <p className="text-center mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="ml-1 cursor-pointer text-amber-600"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>

        <button
          onClick={() => setUserType(null)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-slate-500"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </motion.div>
    </div>
  );
}
