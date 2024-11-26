'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Input } from "@/components/ui/input"
import { BarChart, Calendar, Users, Activity, Search, Bell, Settings, LogOut, User2, User, Key } from 'lucide-react'
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import Link from 'next/link'
import { db } from '@/firebase/config'


export default function PanelDoctor() {

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const [searchQuery, setSearchQuery] = useState('')

  const pacientes10 = [
    { id: 1, patient: "Carlos Asto Gomez", date: "2024-11-26", time: "09:00" },
    { id: 2, patient: "Jesus Castillo Vidal", date: "2024-11-26", time: "10:30" },
    { id: 3, patient: "Ana Martínez Rosado", date: "2024-11-26", time: "11:45" },
    { id: 4, patient: "Carlos Rodríguez Vazquez", date: "2024-11-26", time: "14:00" },
    { id: 5, patient: "Laura Sánchez Mamani", date: "2024-11-26", time: "15:30" },
    { id: 6, patient: "Pedro Gómez Bolaños", date: "2024-11-27", time: "09:15" },
    { id: 7, patient: "Sofia Hernández Gutierrez", date: "2024-11-27", time: "10:45" },
    { id: 8, patient: "Diego Torres ", date: "2024-11-27", time: "12:00" },
    { id: 9, patient: "Valentina Díaz", date: "2024-11-27", time: "14:30" },
    { id: 10, patient: "Javier López", date: "2024-11-27", time: "16:00" },
  ]


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
            <Link href={"/history-doctor"}>
              Historial
            </Link>
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
              <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
              <Users className="h-5 w-5 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TRAER DE LA BD</div>
              <p className="text-xs text-gray-500">+20% desde la última semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Paciente Atendido</CardTitle>
              <User className="h-5 w-5 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TRAER DE LA BD</div>
              <p className="text-xs text-gray-500">2 más que ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <BarChart className="h-5 w-5 text-[#49deb8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-gray-500">+15% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Activity className="h-5 w-5 text-[#49deb8]" />
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
              <CardTitle>Últimos 10 Pacientes Atendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientes10.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.patient}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="text-[#49deb8] border-[#49deb8] hover:bg-[#e6faf5]">
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}