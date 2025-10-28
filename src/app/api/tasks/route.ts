import { NextResponse } from "next/server";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  try {
    const tasksRef = collection(db, "projects", projectId, "tasks");
    const snapshot = await getDocs(tasksRef);
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { projectId, title, status, dueDate } = await req.json();
  if (!projectId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const taskRef = collection(db, "projects", projectId, "tasks");
    const newTask = await addDoc(taskRef, {
      title,
      status: status || "Todo",
      dueDate: dueDate || null,
      createdAt: new Date(),
    });
    return NextResponse.json({ id: newTask.id, title, status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { id, projectId, ...updates } = await req.json();
  if (!id || !projectId) return NextResponse.json({ error: "Missing id/projectId" }, { status: 400 });

  try {
    const taskRef = doc(db, "projects", projectId, "tasks", id);
    await updateDoc(taskRef, updates);
    return NextResponse.json({ message: "Task updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const projectId = searchParams.get("projectId");

  if (!id || !projectId) return NextResponse.json({ error: "Missing id/projectId" }, { status: 400 });

  try {
    await deleteDoc(doc(db, "projects", projectId, "tasks", id));
    return NextResponse.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
