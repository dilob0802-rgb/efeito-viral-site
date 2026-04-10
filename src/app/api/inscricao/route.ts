import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, perfilSocial, desafios } = body;

    // Validação básica
    if (!nome || !perfilSocial || !desafios) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    // Salvar no banco de dados via Prisma
    const lead = await prisma.lead.create({
      data: {
        nome,
        perfilSocial,
        desafios,
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar inscrição:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar sua inscrição.' },
      { status: 500 }
    );
  }
}
