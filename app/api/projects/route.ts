import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/Project";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("GET Projects Error: No token provided");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const projects = await Project.find({ user: payload.userId }).sort({ createdAt: -1 });
    logger.info(`Fetched ${projects.length} projects for user ${token}`);
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    logger.error(`GET Projects Error: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();
    const newProject = await Project.create({
      title: title.trim(),
      status: "todo",
      user: payload.userId,
    });

    logger.info(`Project created: "${newProject.title}" by user ${payload.userId}`);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    logger.error(`POST Project Error: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
