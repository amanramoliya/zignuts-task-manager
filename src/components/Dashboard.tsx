"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
type Project = {
  id: string;
  name: string;
  description?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await getIdToken(user);
        setUser(user);
        setToken(idToken);
        fetchProjects(idToken);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProjects = async (idToken: string) => {
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (res.ok) setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name.trim()) {
      alert("Project name is required.");
      return;
    }

    try {
      setAdding(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        const createdProject = await res.json();
        setProjects((prev) => [...prev, createdProject]);
        setOpenDialog(false);
        setNewProject({ name: "", description: "" });
      } else {
        console.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-100 to-blue-50">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
      <AppBar
        position="static"
        className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg"
      >
        <Toolbar className="flex justify-between">
          <Typography
            variant="h6"
            className="font-semibold tracking-wide text-white"
          >
            Zignuts Task Manager
          </Typography>
          <div className="flex items-center gap-4">
            <Typography
              variant="body2"
              className="text-white/90 hidden sm:block"
            >
              {user?.email}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              className="hover:bg-white/20 rounded-lg px-3"
            >
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Box className="p-6 max-w-6xl mx-auto flex-1 w-full">
        <Typography
          variant="h4"
          className="font-bold mb-6 pb-6 text-gray-800 text-center sm:text-left"
        >
          Projects Dashboard
        </Typography>

        {projects.length === 0 ? (
          <Typography
            variant="body1"
            className="text-gray-600 text-center mt-10"
          >
            No projects found. Click the + button to add your first one!
          </Typography>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className="
            relative overflow-hidden cursor-pointer
            bg-gradient-to-br from-white via-indigo-50 to-blue-50
            border border-indigo-100 shadow-md
            hover:shadow-2xl hover:-translate-y-2
            transition-all duration-300 ease-out
            rounded-2xl group
          "
              >
                <div
                  className="
              absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-br from-indigo-100/40 via-purple-50/30 to-blue-100/40
              transition-opacity duration-300
            "
                ></div>

                <CardContent className="relative p-6 space-y-3">
                  <Typography
                    variant="h6"
                    className="
                font-semibold text-gray-900 tracking-tight
                group-hover:text-indigo-700 transition-colors
              "
                  >
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    className="text-gray-600 leading-relaxed line-clamp-3"
                  >
                    {project.description || "No description available."}
                  </Typography>

                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs text-gray-500 italic">
                      Click to open →
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Box>


      {/* ✅ Add Project Button */}
      <Fab
        color="primary"
        aria-label="add"
        className="!fixed bottom-8 right-8 shadow-lg hover:shadow-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* ✅ Add Project Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="font-semibold text-gray-800">
          Add New Project
        </DialogTitle>
        <DialogContent className="space-y-4 mt-2">
          <TextField
            label="Project Name"
            fullWidth
            required
            variant="outlined"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions className="pb-4 pr-6">
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddProject}
            variant="contained"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={adding}
          >
            {adding ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add Project"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
