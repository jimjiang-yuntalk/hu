import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();
    
    if (!tag) {
      return Response.json({ error: "Tag is required" }, { status: 400 });
    }

    // 更新或创建标签点击记录
    const existingTag = await prisma.tagClick.findUnique({
      where: { tag }
    });

    if (existingTag) {
      await prisma.tagClick.update({
        where: { tag },
        data: { 
          count: existingTag.count + 1,
          lastClickedAt: new Date()
        }
      });
    } else {
      await prisma.tagClick.create({
        data: { 
          tag, 
          count: 1,
          lastClickedAt: new Date()
        }
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error recording tag click:", error);
    return Response.json({ error: "Failed to record click" }, { status: 500 });
  }
}