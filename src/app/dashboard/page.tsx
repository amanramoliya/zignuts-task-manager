"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, CircularProgress, Typography, Box } from "@mui/material";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        router.replace("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!user) return null; // Wait until auth check completes

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Box className="bg-white p-10 rounded-2xl shadow-md text-center">
        <Typography variant="h5" mb={2}>
          Welcome, {user.email}
        </Typography>

        <Typography variant="body1" mb={4}>
          You’re now on the dashboard 🚀
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </div>
  );
}
