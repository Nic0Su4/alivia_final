import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAllDoctors } from "./doctorUtils";

const clave = "AIzaSyDv5stBhwypguJ6khEgUPQ1OERWZCMl6vc"; // Copia tu clave aquí
const genAI = new GoogleGenerativeAI(clave);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chatInstance: any = null; // Almacena la instancia de chat

export const iniciarChat = async (
  history: { role: string; parts: { text: string }[] }[]
) => {
  const doctors = await fetchAllDoctors();

  const validDoctors = doctors.filter(
    (doctor) =>
      doctor.firstName &&
      doctor.lastName &&
      doctor.specialty?.name &&
      doctor.workplace &&
      doctor.contactNumber
  );

  const recommendationContext = validDoctors
    .map(
      (doctor) =>
        `- Dr./Dra. ${doctor.firstName} ${doctor.lastName} (${doctor.specialty.name}, ${doctor.workplace}, Contacto: ${doctor.contactNumber}).`
    )
    .join("\n");

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Eres un chatbot llamado AlivIA, principalmente los usuarios serán de Perú, especializado en asistencia virtual de salud. Tu principal función es ayudar a los usuarios a identificar posibles diagnósticos preliminares basados en los síntomas que describan y recomendar médicos.
    Cuando un usuario menciona síntomas, tu trabajo es:
  1. Hacer preguntas claras y específicas basadas en los síntomas mencionados.
  2. Asegurarte de obtener suficiente información antes de dar cualquier recomendación.
  3. Presentar recomendaciones de doctores únicamente después de confirmar que tienes todos los detalles necesarios.
  Recuerda que siempre debes ser amable, profesional y claro en tus respuestas. Siempre que sea posible, intenta ser útil y brindar información relevante. Siempre que sea necesario, recuerda a los usuarios que consulten a un médico o profesional de la salud.
  Los doctores que tendrás para recomendar, los cuales solo recomendarás luego de estar seguro de tener todos los detalles necesarios, son:
    ${recommendationContext || ""}
    En caso te pregunten otra cosa, responde amablemente pero recuérdales que tu función principal es ayudar con diagnósticos preliminares. Recuerda que siempre que te pregunten otra cosa, les respondes pero les recuerdas tu función principal en ese mismo mensaje.`,
  });

  chatInstance = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 500,
    },
  });
};

export const enviarMensaje = async (mensaje: string) => {
  if (!chatInstance) throw new Error("El chat no ha sido iniciado.");

  const result = await chatInstance.sendMessage(mensaje); // Envía el mensaje del usuario
  const response = await result.response;
  return response.text();
};
