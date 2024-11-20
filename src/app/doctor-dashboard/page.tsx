"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Doctor } from "@/utils/types";
import { DoctorStore, useDoctorStore } from "@/store/doctor";
import Image from "next/image";
import logoDoctor from "../../imgs/Captura de pantalla 2024-11-20 115110.png"
import Link from "next/link";

export default function WelcomePage() {

  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <CardTitle className="text-3xl font-bold text-[#49deb8]">
                Bienvenido a Alivia Doctor
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="space-y-4 text-center md:text-left"
            >
              <h2 className="text-2xl font-semibold text-gray-800">Dr. {doctor?.lastName}</h2>
              <p className="text-lg text-gray-600">
                Gracias por elegir trabajar con nosotros
              </p>
              <p className="text-gray-600">
                Estamos emocionados de tenerle a bordo. Su experiencia y dedicación serán fundamentales para brindar
                una atención excepcional a nuestros pacientes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="w-full md:w-1/2"
            >
              <Image
                src={logoDoctor}
                width={300}
                height={200}
                alt="ilustracion-doctor"
              />
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <Button size="lg" className="bg-[#49deb8] hover:bg-[#4fb198] text-white">
                <Link href={"/panel-doctor"}>
                    Ir al Dashboard
                </Link>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
