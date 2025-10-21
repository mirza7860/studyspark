// SignupPage.jsx
import { useState } from "react";
import { supabase } from "../services/supabaseService";
import { Link } from "react-router-dom";

const SignupPage = () => {
  const [name, setName] = useState(""); // NEW: user's full name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e?.preventDefault?.();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);

    try {
      // Try to support both supabase-js v2 and v1 shapes for signUp
      if (supabase.auth.signUp) {
        // v2 signature: signUp({ email, password, options: { data: {...} } })
        // v1 also exposes signUp but with a different 2nd arg; we check for v2-style by probing function length
        // We'll attempt v2 first by passing options; if the response contains an error, fallback will be attempted.
        // Note: some SDK versions accept both shapes; this is a best-effort compatibility approach.
        try {
          const maybeV2 = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          });
          if (maybeV2?.error) {
            // fall through to try v1 shape if present
            throw maybeV2.error;
          } else {
            setSuccessMsg(
              "Signup successful. Check your email for a confirmation link (if enabled)."
            );
            setName("");
            setEmail("");
            setPassword("");
            setLoading(false);
            return;
          }
        } catch (v2err) {
          // attempt v1 style (some older clients accept signUp(payload, { data }))
          try {
            const maybeV1 = await supabase.auth.signUp(
              { email, password },
              { data: { full_name: name } }
            );
            if (maybeV1?.error) {
              throw maybeV1.error;
            } else {
              setSuccessMsg(
                "Signup successful. Check your email for a confirmation link (if enabled)."
              );
              setName("");
              setEmail("");
              setPassword("");
              setLoading(false);
              return;
            }
          } catch (v1err) {
            // If both attempts failed, throw the original error (prefer v2's message if available)
            throw v2err || v1err;
          }
        }
      } else {
        throw new Error("Supabase auth client not available.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Create your account
        </h1>
        <p className="text-sm text-slate-500 text-center mt-2">
          Sign up to start using StudySpark
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
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">
              Full name
            </span>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-200 px-4 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 text-gray-800 focus:ring-blue-200"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Password</span>
            <input
              type="password"
              className="mt-1 w-full text-gray-800 rounded-md border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Sign up with email"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <div className="text-xs text-slate-400">or</div>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <p className="text-xs text-slate-500 text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
