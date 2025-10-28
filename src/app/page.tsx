"use client";
import { Button } from "@mui/material";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Zignuts Task Manager</h1>
      <Button variant="contained">Test MUI Button</Button>
    </div>
  );
}
