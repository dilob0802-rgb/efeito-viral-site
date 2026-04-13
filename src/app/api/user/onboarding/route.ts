import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { niche, subscribers, mainGoals, painPoints, selectedMentor } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        niche,
        subscribers,
        mainGoal: Array.isArray(mainGoals) ? mainGoals.join(", ") : mainGoals,
        painPoints: Array.isArray(painPoints) ? painPoints.join(", ") : painPoints,
        selectedMentor,
        onboardingComplete: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error("Erro no onboarding:", error);
    return NextResponse.json({ error: "Falha ao salvar preferências." }, { status: 500 });
  }
}
