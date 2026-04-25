import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  Mail,
  Lock,
  Phone,
  MapPin,
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
        "belaku_user",
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
        "belaku_user",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white p-6">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-bold text-center mb-12">
            Join{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
              Belaku
            </span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Politician */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => setUserType("politician")}
              className="p-8 bg-white/10 rounded-3xl border border-white/20 cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-3">Politician</h2>
              <p className="text-gray-300 text-center mb-4">
                Manage profile, post initiatives & interact with citizens.
              </p>
            </motion.div>

            {/* Citizen */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => setUserType("citizen")}
              className="p-8 bg-white/10 rounded-3xl border border-white/20 cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-3">Citizen</h2>
              <p className="text-gray-300 text-center mb-4">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              userType === "politician"
                ? "bg-gradient-to-br from-yellow-400 to-red-500"
                : "bg-gradient-to-br from-blue-400 to-purple-500"
            }`}
          >
            {userType === "politician" ? <User size={40} /> : <Users size={40} />}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-300">
            {userType === "politician" ? "Politician Portal" : "Citizen Portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username only for signup */}
          {mode === "signup" && (
            <div>
              <label className="text-sm mb-1 block">Username</label>
              <input
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
              className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
              className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl"
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
                ? "bg-gradient-to-r from-yellow-500 to-red-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
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
            className="text-yellow-400 ml-1 cursor-pointer"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>

        <button
          onClick={() => setUserType(null)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </motion.div>
    </div>
  );
}
