'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BarChart, Calendar, Users, Activity, Search, Bell, Settings, LogOut, User2, User, Key } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import Link from 'next/link'


export default function HistoryDoctor() {

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const [dateFilter, setDateFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const recommendedPatients = [
    { id: 1, patient: "Elena Ramírez", date: "2024-11-25", type: "Consulta General", status: "Atendido" },
    { id: 2, patient: "Roberto Fernández", date: "2024-11-25", type: "Seguimiento", status: "Pendiente" },
    { id: 3, patient: "Carmen Ortiz", date: "2024-11-24", type: "Examen Físico", status: "Atendido" },
    { id: 4, patient: "Miguel Ángel Castro", date: "2024-11-24", type: "Consulta General", status: "Cancelado" },
    { id: 5, patient: "Isabel Vargas", date: "2024-11-23", type: "Vacunación", status: "Atendido" },
  ]

  const filteredPatients = recommendedPatients.filter(patient => {
    if (dateFilter !== 'all' && patient.date !== dateFilter) return false;
    return true;
  });


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
            <Link href={"/panel-doctor"}>

              Dashboard
            </Link>
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
              <CardTitle>Historial de Pacientes Recomendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="2024-11-25">25/11/2024</SelectItem>
                    <SelectItem value="2024-11-24">24/11/2024</SelectItem>
                    <SelectItem value="2024-11-23">23/11/2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.patient}</TableCell>
                      <TableCell>{patient.date}</TableCell>
                      <TableCell>{patient.type}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${patient.status === 'Atendido' ? 'bg-green-100 text-green-800' : 
                            patient.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {patient.status}
                        </span>
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