"use client";

import { Button } from "@/components/ui/button";
import { BarChart, Calendar, LogOut, Users, Clock } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

export default function PanelDoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const handleLogout = () => {
    localStorage.removeItem("doctor");
    redirect("/");
  };

  const isActiveLink = (path: string) =>
    pathname.includes(path)
      ? "bg-[#e6faf5] text-[#49deb8]"
      : "text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6faf5] to-[#ccf7eb]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-5">
          <h1 className="text-2xl font-bold text-[#49deb8]">Alivia Doctor</h1>
        </div>
        <nav className="mt-8">
          <Link href={"/panel-doctor/dashboard"}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isActiveLink("dashboard")}`}
            >
              <BarChart className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link href={"/panel-doctor/schedule"}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isActiveLink("schedule")}`}
            >
              <Clock className="mr-2 h-5 w-5" />
              Mi Horario
            </Button>
          </Link>
          <Link href={"/panel-doctor/history-doctor"}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isActiveLink(
                "history-doctor"
              )}`}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Historial de pacientes
            </Button>
          </Link>
          <Link href={"/panel-doctor/doctor-profile"}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isActiveLink(
                "doctor-profile"
              )}`}
            >
              <Users className="mr-2 h-5 w-5" />
              Perfil
            </Button>
          </Link>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Salir
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      {children}
    </div>
  );
}
