import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Definir las rutas protegidas para el administrador
  const isAdminPath =
    path.startsWith("/admin") && !path.startsWith("/admin/login");

  // Verificar si hay un token de administrador en las cookies
  const adminSession = request.cookies.get("admin")?.value;

  // Si es una ruta de administrador y no hay sesión, redirigir al login
  if (isAdminPath && !adminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

// Configurar las rutas que deben ser verificadas por el middleware
export const config = {
  matcher: ["/admin/:path*"],
};
