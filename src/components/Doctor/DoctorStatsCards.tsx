"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { PatientStats } from "@/utils/doctorUtils"; // Asegúrate de exportar este tipo

// Paleta de colores para los gráficos
const COLORS_GENDER = ["#0088FE", "#FF8042", "#FFBB28"];
const COLORS_AGE = ["#00C49F", "#FFBB28", "#0088FE", "#FF8042"];

interface DoctorStatsCardsProps {
  stats: PatientStats | null;
  loading: boolean;
}

export const DoctorStatsCards = ({ stats, loading }: DoctorStatsCardsProps) => {
  // Si está cargando, mostramos esqueletos
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-[#aef1e1]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-[#aef1e1]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-[#aef1e1]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-[#aef1e1]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no hay datos o hubo un error
  if (!stats || stats.totalPatients === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center mt-8">
        <h3 className="text-xl font-semibold mb-4">
          Estadísticas de Pacientes
        </h3>
        <p className="text-gray-600">
          No hay suficientes datos de pacientes para generar estadísticas.
        </p>
      </div>
    );
  }

  // Transformamos los datos para que Recharts los pueda usar
  const genderData = [
    { name: "Hombres", value: stats.genderDistribution.masculino },
    { name: "Mujeres", value: stats.genderDistribution.femenino },
    { name: "Otros", value: stats.genderDistribution.otro },
  ].filter((item) => item.value > 0);

  const ageData = [
    { name: "Niños (0-17)", value: stats.ageDistribution.nino },
    { name: "Jóvenes (18-29)", value: stats.ageDistribution.joven },
    { name: "Adultos (30-59)", value: stats.ageDistribution.adulto },
    { name: "Adultos Mayores (60+)", value: stats.ageDistribution.adultoMayor },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Tarjeta para el gráfico de Género */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Distribución por Género</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name[0]} - ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((_entry, index) => (
                  <Cell
                    key={`cell-gender-${index}`}
                    fill={COLORS_GENDER[index % COLORS_GENDER.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tarjeta para el gráfico de Edad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Distribución por Edad</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name === "Adultos Mayores (60+)" ? "AM" : name[0]} - ${(
                    percent * 100
                  ).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ageData.map((_entry, index) => (
                  <Cell
                    key={`cell-age-${index}`}
                    fill={COLORS_AGE[index % COLORS_AGE.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
