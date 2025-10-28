"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

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
      // Redirect handled automatically by onAuthStateChanged
    } catch (err: any) {
      alert("Invalid email or password");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Box
        component="form"
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md"
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          Login to Your Account
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={signingIn}
        >
          {signingIn ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>

        <Typography variant="body2" textAlign="center" mt={2}>
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </Typography>
      </Box>
    </div>
  );
}
