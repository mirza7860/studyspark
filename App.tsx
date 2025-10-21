import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./components/DashboardPage";
import { ChatPage } from "./components/ChatPage";
import { VideoChatPage } from "./components/VideoChatPage";
import { ProfilePage } from "./components/ProfilePage";
import { DashboardLayout } from "./components/Layout";
import { HomePage } from "./components/Homepage.tsx";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import { supabase } from "./services/supabaseService";
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!session ? <HomePage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!session ? <SignupPage /> : <Navigate to="/dashboard" />} />

        {/* 👇 Grouped routes wrapped with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/chat/d/:id" element={session ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/chat/v/:id" element={session ? <VideoChatPage /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
