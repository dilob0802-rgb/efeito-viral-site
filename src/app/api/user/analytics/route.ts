import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getYouTubeAnalytics, getRealtimeStats } from "@/lib/youtubeAnalytics";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview"; // overview, realtime

    if (type === "realtime") {
      const stats = await getRealtimeStats(session.user.email);
      return NextResponse.json(stats);
    }

    // Por padrão busca os últimos 30 dias
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const analyticsData = await getYouTubeAnalytics(session.user.email, startDate, endDate);

    return NextResponse.json(analyticsData);

  } catch (error: any) {
    console.error("Erro na rota de Analytics:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
