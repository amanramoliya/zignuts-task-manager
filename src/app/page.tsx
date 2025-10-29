"use client";

import { useEffect, useState } from "react";
import { Button, Typography, Paper, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [user, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLocalUser(firebaseUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleNavigation = () => {
    if (user) router.push("/dashboard");
    else router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <Paper
        elevation={6}
        className="p-10 rounded-2xl shadow-2xl w-[90%] max-w-md backdrop-blur-sm bg-white/90 text-center"
      >
        <Typography
          variant="h4"
          className="font-bold text-indigo-700 mb-4 pb-4"
        >
          Zignuts Task Manager
        </Typography>

        <Typography
          variant="body1"
          className="text-gray-600 mb-8 pb-2"
        >
          {user
            ? `Welcome back, ${user.email}! Let’s get you to your dashboard.`
            : "Manage your projects, track progress, and stay productive — all in one place."}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleNavigation}
          className="!py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          {user ? "Go to Dashboard" : "Login to Continue"}
        </Button>

        {!user && (
          <Typography
            variant="body2"
            className="text-gray-600 mt-4 pt-2"
          >
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </Typography>
        )}
      </Paper>
    </div>
  );
}
