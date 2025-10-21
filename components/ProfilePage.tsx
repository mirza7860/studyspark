// ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseService";

export const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI feedback
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        if (!user) throw new Error("No user found");

        setUser(user);
        setFullName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Update name
  const handleUpdateName = async () => {
    try {
      setError("");
      setMessage("");
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      setMessage("Name updated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating name.");
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    try {
      setError("");
      setMessage("");

      if (!newPassword || newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating password.");
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Profile Settings
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 mb-4 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-sm p-3 mb-4 rounded">
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="text"
              value={email}
              readOnly
              className="w-full border border-slate-200 rounded-md px-4 py-2 text-sm bg-gray-100 text-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-gray-800 border border-slate-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleUpdateName}
              className="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-700 transition"
            >
              Update Name
            </button>
          </div>

          {/* Change Password */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <label className="block text-xs font-medium text-slate-600 mb-1 mt-3">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleUpdatePassword}
              className="mt-3 w-full bg-gray-800 text-white text-sm font-medium py-2 rounded-md hover:bg-gray-900 transition"
            >
              Update Password
            </button>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white text-sm font-medium py-2 rounded-md hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
