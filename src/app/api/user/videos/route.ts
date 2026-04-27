import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Rota desativada conforme solicitação de remoção de conexão via API
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Retorna lista vazia para ocultar a seção no dashboard
    return NextResponse.json({ videos: [] });

  } catch (error: any) {
    console.error("Erro ao buscar vídeos:", error);
    return NextResponse.json({ videos: [] });
  }
}
