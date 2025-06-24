"use client";

import { useDoctorStore } from "@/store/doctor";
import { Doctor } from "@/utils/types";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { ScheduleForm } from "@/components/Doctor/ScheduleForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchedulePage() {
  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDoctor = localStorage.getItem("doctor");
      if (storedDoctor && !doctor) {
        setDoctor(JSON.parse(storedDoctor));
      } else if (!storedDoctor && !doctor) {
        redirect("/");
      }
      setLoading(false);
    }
  }, [doctor, setDoctor]);

  if (loading || !doctor) {
    return (
      <main className="ml-64 p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  return (
    <main className="ml-64 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Horario</h1>
      <div className="max-w-4xl">
        <ScheduleForm doctor={doctor} />
      </div>
    </main>
  );
}
