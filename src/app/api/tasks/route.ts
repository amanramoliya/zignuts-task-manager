import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const tasksRef = adminDB.collection("projects").doc(projectId).collection("tasks");
  const snapshot = await tasksRef.get();

  const tasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const { title, dueDate, status, description } = await req.json();

    if (!projectId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = {
      title,
      dueDate: dueDate || null,
      status: status || "ToDo",
      createdAt: new Date().toISOString(),
      description: description || "",
    };

    const taskRef = await adminDB
      .collection("projects")
      .doc(projectId)
      .collection("tasks")
      .add(newTask);

    return NextResponse.json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty JSON body" },
        { status: 400 }
      );
    }

    const { title, description, status, dueDate } = body;

    if (!projectId || !taskId) {
      return NextResponse.json(
        { error: "Missing projectId or taskId" },
        { status: 400 }
      );
    }

    const taskRef = adminDB
      .collection("projects")
      .doc(projectId)
      .collection("tasks")
      .doc(taskId);

    const updateData: {
      updatedAt: string;
      title?: string;
      description?: string;
      status?: string;
      dueDate?: string | null;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    await taskRef.update(updateData);

    const updatedDoc = await taskRef.get();
    if (!updatedDoc.exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task", details: String(error) },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  if (!projectId || !taskId) {
    return NextResponse.json({ error: "Missing projectId or taskId" }, { status: 400 });
  }

  await adminDB
    .collection("projects")
    .doc(projectId)
    .collection("tasks")
    .doc(taskId)
    .delete();

  return NextResponse.json({ message: "Task deleted successfully" });
}
