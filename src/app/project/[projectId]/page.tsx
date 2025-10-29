"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Box,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthGate from "@/components/AuthGate";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
}

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const { user } = useAuthStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    dueDate: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;
    const fetchTasks = async () => {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/tasks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(await res.json());
      } else {
        console.error("Failed to fetch tasks:", await res.text());
      }
      setLoading(false);
    };
    fetchTasks();
  }, [user, projectId]);

  const handleAddOrUpdateTask = async () => {
    if (!newTask.title?.trim() || !user || !newTask.description?.trim()) return;
    const token = await user.getIdToken();

    const method = editingTask ? "PUT" : "POST";
    const url = editingTask
      ? `/api/tasks?taskId=${editingTask.id}&projectId=${projectId}`
      : `/api/tasks?projectId=${projectId}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });

    if (res.ok) {
      const updated = await res.json();
      if (editingTask) {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditingTask(null);
      } else {
        setTasks((prev) => [...prev, updated]);
      }
      setNewTask({ title: "", description: "", status: "todo", dueDate: "" });
    } else {
      console.error("Failed to add/update task:", await res.text());
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`/api/tasks?taskId=${taskId}&projectId=${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      console.error("Failed to delete task:", await res.text());
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setNewTask({ title: "", description: "", status: "todo", dueDate: "" });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
        <AppBar
          position="sticky"
          className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md"
        >
          <Toolbar className="flex justify-between">
            <div className="flex items-center gap-2">
              <Button
                color="inherit"
                onClick={() => router.push("/dashboard")}
                className="hover:bg-white/10 rounded-md px-3"
              >
                ← Back to Dashboard
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Typography variant="body2" className="text-white/90 hidden sm:block">
                {user?.email}
              </Typography>
              <Button
                color="inherit"
                onClick={handleLogout}
                className="hover:bg-white/10 rounded-md px-3"
              >
                Logout
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <div className="p-6 max-w-4xl mx-auto w-full">
          <Typography variant="h4" className="font-semibold mb-6 text-gray-800">
            Project Tasks
          </Typography>

          <Card className="shadow-sm border mb-8">
            <CardContent>
              <Box className="flex flex-col gap-4">
                <TextField
                  label="Task Title"
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: 200 }}
                />

                <TextField
                  label="Description"
                  value={newTask.description || ""}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  fullWidth
                  multiline
                  minRows={2}
                  variant="outlined"
                />

                <TextField
                  select
                  label="Status"
                  value={newTask.status || "todo"}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      status: e.target.value as "todo" | "in-progress" | "done",
                    })
                  }
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </TextField>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    disablePast
                    value={newTask.dueDate ? new Date(newTask.dueDate) : null}
                    onChange={(date) =>
                      setNewTask({ ...newTask, dueDate: date ? date.toISOString() : "" })
                    }
                    slotProps={{
                      textField: { fullWidth: true, variant: "outlined" },
                    }}
                  />
                </LocalizationProvider>

                <div className="flex flex-wrap gap-3 mt-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddOrUpdateTask}
                    disabled={!newTask.title?.trim() || !newTask.description?.trim()}
                  >
                    {editingTask ? "Update Task" : "Add Task"}
                  </Button>

                  {editingTask && (
                    <Button color="inherit" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Box>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <CircularProgress />
              </div>
            ) : tasks.length === 0 ? (
              <Typography className="text-gray-500 text-center">No tasks yet.</Typography>
            ) : (
              tasks.map((task) => (
                <Card
                  key={task.id}
                  className="shadow-sm border hover:shadow-md transition-all"
                >
                  <CardContent className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-medium">
                        {task.title}
                      </Typography>
                      <Typography className="text-gray-600 mb-2">
                        {task.description || "No description"}
                      </Typography>

                      <div className="flex flex-wrap items-center gap-3">
                        <Chip
                          label={
                            task.status === "todo"
                              ? "To Do"
                              : task.status === "in-progress"
                                ? "In Progress"
                                : "Done"
                          }
                          color={
                            task.status === "done" ? "success" :
                              task.status === "in-progress" ? "warning" :
                                "default"
                          }
                          className="capitalize"
                          size="small"
                        />
                        {task.dueDate && (
                          <Typography className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-1">
                      <IconButton onClick={() => handleEdit(task)} color="primary" size="small" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTask(task.id)} color="error" size="small" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
