"use client"

// --- IMPORTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, User, Mail, Lock, Calendar, Phone, Users, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUserStore, UserStore } from "@/store/user";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { User as UserType } from "@/utils/types";
import { doc, setDoc, Timestamp } from "firebase/firestore";

// --- ESQUEMA DE DATOS ---
const FormSchema = z.object({
  displayName: z.string().min(1, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo electrónico válido").min(1, "Ingresa tu correo electrónico"),
  password: z.string().min(1, "Ingresa tu contraseña").min(8, "La contraseña debe tener al menos 8 caracteres"),
  birthDate: z.string().min(1, "Ingresa tu fecha de nacimiento"),
  phoneNumber: z.string().regex(/^9\d{8}$/, "Ingresa un número de celular válido de 9 dígitos"),
  gender: z.enum(["Masculino", "Femenino", "Otro"], {
    errorMap: () => ({ message: "Selecciona un género" }),
  }),
  summaryHistory: z.string().optional(),
});

const RegisterForm = () => {
  // --- ESTADO Y HOOKS ---
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const setUser = useUserStore((state: UserStore) => state.setUser);
  const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      birthDate: "",
      phoneNumber: "",
      gender: undefined,
      summaryHistory: "",
    },
  });

  useEffect(() => {
    if (error) {
      let message = "Ocurrió un error inesperado al crear la cuenta.";
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo electrónico ya está en uso. Intenta iniciar sesión.';
      }
      form.setError("root", { type: "manual", message });
    }
  }, [error, form]);

  // --- ESTRUCTURA DEL FORMULARIO MULTI-PASO ---
  const steps = [
    { fields: ["displayName", "email"] },
    { fields: ["password"] },
    { fields: ["birthDate", "phoneNumber", "gender"] },
    { fields: ["summaryHistory"] },
  ];

  // --- LÓGICA DE NAVEGACIÓN Y ENVÍO ---
  const handleNext = async () => {
    const currentFields = steps[currentStep].fields;
    const isValid = await form.trigger(currentFields as any);

    if (isValid && currentStep < steps.length - 1) {
      form.clearErrors("root");
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await createUserWithEmailAndPassword(data.email, data.password);
      if (!res) return;

      const userData: UserType = {
        uid: res.user.uid,
        email: data.email,
        displayName: data.displayName,
        birthDate: data.birthDate,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        summaryHistory: data.summaryHistory || "",
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", res.user.uid), userData);
      setUser(userData);
      router.push("/dashboard");

    } catch (e) {
      console.error("Error saving user profile to Firestore: ", e);
      form.setError("root", { type: "manual", message: "No se pudo guardar tu perfil. Inténtalo de nuevo." });
    }
  };

  // --- RENDERIZADO DEL CONTENIDO DE CADA PASO ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Nombre completo
              </Label>
              <Input
                id="displayName"
                placeholder="Tu nombre completo"
                {...form.register("displayName")}
                className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
              />
              {form.formState.errors.displayName && (
                <p className="text-red-500 text-sm">{form.formState.errors.displayName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...form.register("email")}
                className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...form.register("password")}
                className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-gray-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Fecha de nacimiento
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
                className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
              />
              {form.formState.errors.birthDate && (
                <p className="text-red-500 text-sm">{form.formState.errors.birthDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-700 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Número de celular
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="900000000"
                {...form.register("phoneNumber")}
                className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Género
              </Label>
              <Select onValueChange={(value) => form.setValue("gender", value as any)}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg">
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-red-500 text-sm">{form.formState.errors.gender.message}</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summaryHistory" className="text-gray-700 font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Historial Médico Relevante (Opcional)
              </Label>
              <Textarea
                id="summaryHistory"
                placeholder="Ejemplo: soy alérgico a la penicilina..."
                {...form.register("summaryHistory")}
                className="min-h-[120px] rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg resize-none"
              />
              <p className="text-sm text-gray-500">Informa sobre condiciones o alergias importantes.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm font-medium text-emerald-600">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6 min-h-[250px] flex flex-col justify-center">
          {renderStepContent()}
        </div>
        
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm font-semibold text-center mt-4">
            {form.formState.errors.root.message}
          </p>
        )}
        
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <Button
              type="button"
              onClick={handlePrev}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Anterior
            </Button>
          )}
          <Button
            type="button"
            onClick={
              currentStep === steps.length - 1
                ? form.handleSubmit(onSubmit)
                : handleNext
            }
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
          >
            {loading ? <Spinner size="small" /> : (currentStep === steps.length - 1 ? "Crear cuenta" : "Continuar")}
          </Button>
        </div>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-gray-100">
        <span className="text-gray-500">¿Ya tienes una cuenta?</span>{" "}
        <Link href="/login" className="text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;