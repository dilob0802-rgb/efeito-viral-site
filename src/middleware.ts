import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const isOnboardingPage = req.nextUrl.pathname.startsWith("/membros/onboarding");

    // 1. Se estiver na página de login e já estiver autenticado
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/membros", req.url));
      }
      return null;
    }

    // 2. Se não estiver autenticado e tentar acessar área de membros
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // 3. Permite navegação livre (Onboarding será mostrado via componente quando necessário)
    return null;
  },
  {
    callbacks: {
      async authorized() {
        // Isso retorna true para que o middleware acima gerencie o redirecionamento
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/membros/:path*", "/login"],
};
