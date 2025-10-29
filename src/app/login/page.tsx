"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // ✅ Keeps user logged in after refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        router.replace("/dashboard");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error(error);
      alert("Invalid email or password");
    } finally {
      setSigningIn(false);
    }
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
        className="p-10 rounded-2xl shadow-2xl w-[90%] max-w-md backdrop-blur-sm bg-white/90"
      >
        <Typography
          variant="h4"
          className="font-bold text-center text-indigo-700 mb-6"
        >
          Welcome Back 👋
        </Typography>
        <Typography
          variant="body1"
          className="text-gray-600 text-center mb-8 pb-4"
        >
          Sign in to continue managing your projects
        </Typography>

        <Box component="form" onSubmit={handleLogin} className="space-y-5">
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            className="!mt-2 !py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
            disabled={signingIn}
          >
            {signingIn ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>

          <Typography
            variant="body2"
            className="text-center text-gray-600 mt-4"
          >
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}
