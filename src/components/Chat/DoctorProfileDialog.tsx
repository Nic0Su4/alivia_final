// src/components/Chat/DoctorProfileDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { Doctor } from "@/utils/types";
import { getDoctorById } from "@/utils/doctorUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Phone, Stethoscope, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface DoctorProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string | null;
}

export const DoctorProfileDialog = ({
  isOpen,
  onClose,
  doctorId,
}: DoctorProfileDialogProps) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchDoctor = async () => {
        setLoading(true);
        try {
          const fetchedDoctor = await getDoctorById(doctorId);
          setDoctor(fetchedDoctor);
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctor();
    }
  }, [isOpen, doctorId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil del Doctor</DialogTitle>
          <DialogDescription>
            Información detallada del especialista.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : doctor ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-muted-foreground">{doctor.specialty.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {doctor.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {doctor.contactNumber}
              </p>
              <p className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                {doctor.workplace}
              </p>
            </div>
          </div>
        ) : (
          <p>No se pudo cargar la información del doctor.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
