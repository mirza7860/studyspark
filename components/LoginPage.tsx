// LoginPage.jsx
import { useState } from "react";
import { supabase } from "../services/supabaseService";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // Prefer v2 API (signInWithPassword), fallback to v1 (signIn)
      if (supabase.auth.signInWithPassword) {
        // supabase-js v2+
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Success — adjust redirect as needed
        setSuccessMsg("Successfully signed in.");
        // If you want to redirect automatically:
        navigate("/dashboard");
      } else if (supabase.auth.signIn) {
        // supabase-js v1
        const { user, session, error } = await supabase.auth.signIn({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMsg("Successfully signed in.");
        navigate("/dashboard");
      } else {
        throw new Error("Supabase client does not expose a sign-in method.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.message ?? "Login failed. Check credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 text-center mt-2">
          Log in to continue to StudySpark
        </p>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Email</span>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">
                Password
              </span>
            </div>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-slate-500 text-center mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
