/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchDoctorsBySpecialty } from "../doctorUtils";
import { Doctor, Specialty, User } from "../types";
import {
  CHATBOT_CONSTANTS,
  ChatMessage,
  EnviarMensajeProps,
} from "./chatbot.types";
import openai from "./openaiClient";

const calculateAge = (birthDateString: string | undefined): number | null => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const createSystemPrompt = (
  specialtiesList: string,
  selectedSpecialty: Specialty | null,
  userInfo: User | null
): string => {
  let userContext = "";
  if (userInfo) {
    const age = calculateAge(userInfo.birthDate);
    const details = [
      userInfo.displayName ? `se llama ${userInfo.displayName}` : "",
      age ? `tiene ${age} años` : "",
      userInfo.gender ? `su género es ${userInfo.gender}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    if (details) {
      userContext = `\n\n**Contexto del Usuario:** Estás hablando con un usuario que ${details}. Ten en cuenta esta información para personalizar tus preguntas y recomendaciones.`;
    }

    if (userInfo.summaryHistory) {
      userContext += `\n**Historial Médico Relevante:** El usuario ha indicado lo siguiente: "${userInfo.summaryHistory}".`;
    }
  }
  if (selectedSpecialty) {
    // Prompt cuando ya hay una especialidad seleccionada
    return `Eres un chatbot llamado AlivIA especializado en ${selectedSpecialty.name}, para usuarios de Perú. Tu función es ayudar a identificar posibles diagnósticos preliminares relacionados con ${selectedSpecialty.name}. ${userContext}
    
    Como especialista en ${selectedSpecialty.name}, debes:
    1. Hacer preguntas específicas y relevantes para esta especialidad.
    2. Enfocarte en síntomas y condiciones de ${selectedSpecialty.name}.
    3. Al final de tu respuesta, incluye una línea que comience con "${CHATBOT_CONSTANTS.DIAGNOSIS_KEY}" seguida de una lista de posibles condiciones.
    4. Mantén la recomendación de especialidad como "${CHATBOT_CONSTANTS.RECOMMENDATION_KEY}${selectedSpecialty.name}" al final.
    
    Recuerda: Sé amable, pregunta una a una y recuérdales a los usuarios consultar a un profesional.`;
  }

  // Prompt general por defecto
  return `Eres un chatbot llamado AlivIA, para usuarios de Perú, especializado en asistencia de salud. Tu función es ayudar a los usuarios a identificar síntomas y recomendar médicos de las siguientes especialidades: ${specialtiesList}. ${userContext}

  Tu trabajo es:
  1. Hacer preguntas claras para entender los síntomas.
  2. Cuando estés seguro, incluye al final de tu mensaje la línea "${CHATBOT_CONSTANTS.RECOMMENDATION_KEY}" seguida de la especialidad. Ejemplo: "${CHATBOT_CONSTANTS.RECOMMENDATION_KEY}Cardiología". No uses espacio después de los dos puntos.
  3. Si identificas posibles diagnósticos, añádelos después de la línea "${CHATBOT_CONSTANTS.DIAGNOSIS_KEY}".
  
  Recuerda: Sé amable, profesional, haz una pregunta por mensaje y recuérdales a los usuarios que deben consultar a un médico para un diagnóstico real.`;
};

export const enviarMensaje = async ({
  mensaje,
  history,
  specialties,
  userInfo,
  onStreamUpdate,
  onDoctorRecommendation,
  selectedSpecialty,
}: EnviarMensajeProps) => {
  const specialtiesList = specialties.map((s) => s.name).join(", ");

  // Usamos la función auxiliar para generar el prompt
  const systemPrompt = createSystemPrompt(
    specialtiesList,
    selectedSpecialty,
    userInfo
  );

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: mensaje },
  ];

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: CHATBOT_CONSTANTS.MODEL_NAME,
      messages: messages as any,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta?.content || "";
      fullResponse += content;
      onStreamUpdate(content);
    }

    const recommendationMatch = fullResponse.match(
      CHATBOT_CONSTANTS.RECOMMENDATION_REGEX
    );
    const diagnosisMatch = fullResponse.match(
      CHATBOT_CONSTANTS.DIAGNOSIS_REGEX
    );

    if (diagnosisMatch && !selectedSpecialty) {
      onStreamUpdate(
        "\n\n⚠️ Estos son solo posibles diagnósticos preliminares. Siempre consulta con un profesional médico para un diagnóstico adecuado."
      );
    }

    if (recommendationMatch && onDoctorRecommendation) {
      const specialtyName = recommendationMatch[1].trim();
      const specialty = specialties.find(
        (s) => s.name.toLowerCase() === specialtyName.toLowerCase()
      );

      if (specialty) {
        const doctors = await fetchDoctorsBySpecialty(specialty.id);
        if (doctors.length > 0) {
          const randomIndex = Math.floor(Math.random() * doctors.length);
          onDoctorRecommendation(doctors[randomIndex]);
          onStreamUpdate(
            "\n\n¡Buenas noticias! He encontrado un especialista que puede ayudarte. Dale click al botón al lado de enviar para ver los datos del doctor"
          );
        } else {
          onStreamUpdate(
            `\n\nEn este momento no hay especialistas en ${specialtyName} disponibles. Te recomendamos contactar con tu centro de salud.`
          );
          onDoctorRecommendation(null);
        }
      } else {
        onStreamUpdate(
          `\n\nLa especialidad "${specialtyName}" no está disponible.`
        );
        onDoctorRecommendation(null);
      }
    }
  } catch (error: unknown) {
    // Usamos 'unknown' para un manejo de errores más seguro
    let errorMessage = "Error al obtener la respuesta de OpenAI";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error al obtener la respuesta de OpenAI: ", errorMessage);
    throw new Error(errorMessage);
  }
};

export const iniciarChat = (
  specialties: Specialty[],
  conversationHistory: ChatMessage[] = [],
  userInfo: User | null
): ChatMessage[] => {
  const specialtiesList = specialties.map((s) => s.name).join(", ");
  const initialSystemMessage = {
    role: "system" as const,
    content: createSystemPrompt(specialtiesList, null, userInfo),
  };

  return [initialSystemMessage, ...conversationHistory];
};
