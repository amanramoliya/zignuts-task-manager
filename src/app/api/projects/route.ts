import { NextResponse } from "next/server";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase-admin/auth"; // optional for verification
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";

// Initialize Firebase Admin (server-side only)
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const q = query(collection(db, "projects"), where("ownerId", "==", decoded.uid));
    const snapshot = await getDocs(q);

    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const { name, description } = await req.json();

    const newDoc = await addDoc(collection(db, "projects"), {
      ownerId: decoded.uid,
      name,
      description,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: newDoc.id, name, description });
  } catch (err) {
    console.error("Error creating project:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
