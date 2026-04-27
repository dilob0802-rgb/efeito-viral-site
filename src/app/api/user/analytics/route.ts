import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Rota de analytics desativada conforme solicitação
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    return NextResponse.json({ 
      rows: [], 
      columnHeaders: [],
      message: "Analytics desativado. Use o formulário de ecossistema para atualizar seus dados manualmente." 
    });

  } catch (error: any) {
    return NextResponse.json({ rows: [] });
  }
}
