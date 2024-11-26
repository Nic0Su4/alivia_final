"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Save } from "lucide-react";
import { useDoctorStore } from "@/store/doctor";
import { Doctor } from "@/utils/types";
import { redirect } from "next/navigation";
import EditDoctorForm from "@/components/Doctor/EditDoctorForm";

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDoctor = localStorage.getItem("doctor");
      if (storedDoctor && !doctor) {
        setDoctor(JSON.parse(storedDoctor));
      } else if (!storedDoctor && !doctor) {
        redirect("/");
      }
    }
  }, [doctor, setDoctor]);

  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctor(updatedDoctor);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ml-64 from-[#e6faf5] to-[#ccf7eb] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-[#49deb8]">
              Perfil del Doctor
            </CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#49deb8] hover:bg-[#3bc7a3]"
            >
              {isEditing ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <Edit2 className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src="/placeholder.svg?height=128&width=128"
                  alt="Dr. Profile"
                />
                <AvatarFallback>
                  {doctor?.firstName[0]}
                  {doctor?.lastName[0]}
                </AvatarFallback>
              </Avatar>

              {doctor && (
                <EditDoctorForm
                  doctor={doctor}
                  onUpdate={handleUpdateDoctor}
                  isEditable={isEditing}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
