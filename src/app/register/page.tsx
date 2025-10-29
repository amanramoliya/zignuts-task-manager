"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="flex flex-col items-center p-8">
          <Typography variant="h4" className="font-semibold text-indigo-600 mb-6">
            Create Account
          </Typography>

          <div className="w-full flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              required
              className="bg-white rounded-lg"
            />
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              className="bg-white rounded-lg"
            />
            {error && (
              <Typography variant="body2" color="error" className="text-center">
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              type="submit"
              onClick={handleRegister}
              disabled={loading || !email.trim() || !password.trim()}
              color="primary"
              size="large"
            className="!mt-2 !py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Register"}
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="text"
              fullWidth
              sx={{
                mt: 1,
                color: "#6366f1",
                textTransform: "none",
                "&:hover": { color: "#4f46e5" },
              }}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
