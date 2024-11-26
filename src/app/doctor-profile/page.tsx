'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react'
import { useDoctorStore } from '@/store/doctor'
import { Doctor } from '@/utils/types'

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Dr. Juan Pérez",
    specialty: "Medicina General",
    email: "juan.perez@aliviadoctor.com",
    phone: "+1 234 567 8900",
    address: "Calle Principal 123, Ciudad Médica",
    bio: "Médico general con más de 15 años de experiencia. Especializado en atención primaria y prevención de enfermedades crónicas."
  })

  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los cambios en el backend
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDoctorInfo(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6faf5] to-[#ccf7eb] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-[#49deb8]">Perfil del Doctor</CardTitle>
            <Button onClick={isEditing ? handleSave : handleEdit} className="bg-[#49deb8] hover:bg-[#3bc7a3]">
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Dr. Juan Pérez" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={doctorInfo.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={doctorInfo.specialty}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    value={doctorInfo.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={doctorInfo.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={doctorInfo.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Pacientes Atendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#49deb8]">1,234</p>
              <p className="text-sm text-gray-500">Último mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Satisfacción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#49deb8]">98%</p>
              <p className="text-sm text-gray-500">Basado en 500 reseñas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Próxima Cita</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <Calendar className="h-5 w-5 text-[#49deb8] mr-2" />
              <p className="text-lg font-semibold">Hoy, 15:30</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}