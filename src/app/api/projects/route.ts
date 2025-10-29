import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const snapshot = await adminDB
      .collection("projects")
      .where("userId", "==", decoded.uid)
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const body = await req.json();

    if (!body.name || !body.description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newProjectRef = await adminDB.collection("projects").add({
      userId: decoded.uid,
      name: body.name,
      description: body.description,
      createdAt: new Date(),
    });

    const newProject = await newProjectRef.get();

    return NextResponse.json({ id: newProject.id, ...newProject.data() });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
