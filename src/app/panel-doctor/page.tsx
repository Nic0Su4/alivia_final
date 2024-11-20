'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BarChart, Calendar, Users, Activity, Search, Bell, Settings, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation";


export default function PanelDoctor() {

    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/");
      };
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6faf5] to-[#ccf7eb]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-5">
          <h1 className="text-2xl font-bold text-[#49deb8]">Alivia Doctor</h1>
        </div>
        <nav className="mt-8">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]">
            <BarChart className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]">
            <Calendar className="mr-2 h-5 w-5" />
            Citas
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]">
            <Users className="mr-2 h-5 w-5" />
            Pacientes
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#49deb8] hover:bg-[#e6faf5]">
            <Activity className="mr-2 h-5 w-5" />
            Estadísticas
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
              <Users className="h-4 w-4 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-gray-500">+20% desde el último mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">3 más que ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <BarChart className="h-4 w-4 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-gray-500">+15% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Activity className="h-4 w-4 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-gray-500">+2% desde la última semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional content can be added here */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aquí se puede agregar una tabla o lista de próximas citas */}
              <p className="text-gray-600">Lista de próximas citas se mostraría aquí...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}