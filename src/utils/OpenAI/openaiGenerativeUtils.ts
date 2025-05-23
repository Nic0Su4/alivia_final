/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchDoctorsBySpecialty } from "../doctorUtils";
import { getSpecialties } from "../specialtiesUtils";
import { Doctor } from "../types";
import openai from "./openaiClient";

//SE DEFINE PARA ENVIAR MENSJE AL BOT

export const enviarMensaje = async (
  mensaje: string,
  history: any[] = [],
  onStreamUpdate: (chunk: string) => void,
  onDoctorRecommendation?: (doctor: Doctor | null) => void
) => {
  const specialties = await getSpecialties();
  const specialtiesList = specialties.map((s) => s.name).join(", ");

  const messages = [
    {
      role: "system",
      content: `Eres un chatbot llamado AlivIA, principalmente los usuarios serán de Perú, especializado en asistencia virtual de salud. Tu principal función es ayudar a los usuarios a identificar posibles diagnósticos preliminares basados en los síntomas que describan y recomendar médicos.

      Las especialidades disponibles son: ${specialtiesList}. Solo debes recomendar especialidades de esta lista.
      
      Cuando un usuario menciona síntomas, tu trabajo es:
      1. Hacer preguntas claras y específicas basadas en los síntomas mencionados.
      2. Asegurarte de obtener suficiente información antes de dar cualquier recomendación.
      3. Cuando estés seguro de qué tipo de especialista necesita el usuario, debes incluir al final de tu mensaje una línea que comience exactamente con "RECOMENDACIÓN DE ESPECIALIDAD:" seguida de la especialidad requerida. Por ejemplo: "RECOMENDACIÓN DE ESPECIALIDAD:Cardiología"
      
      Recuerda:
      - Sé amable y profesional en tus respuestas
      - Si un usuario menciona temas off-topic, recuérdales tu función principal
      - Proporciona información relevante
      - Recuerda a los usuarios que deben consultar a un profesional de la salud
      - Solo incluye RECOMENDACIÓN DE ESPECIALIDAD cuando estés seguro de la especialidad necesaria
      - La recomendación debe ir en la última línea de tu respuesta
      - Hacer preguntas una por una, para no sobrecargar de preguntas al usuario, y no hostigarlo o hacer que se olvide de responder ciertas preguntas si son preguntadas todas en el mismo mensaje, trata de preguntar puntualmente y la pregunta que te permita obtener más información, pero solo una por mensaje.
      
      En caso te pregunten otra cosa, responde amablemente pero recuérdales que tu función principal es ayudar con diagnósticos preliminares.`,
    },
    ...history,
    { role: "user", content: mensaje },
  ];

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta?.content || "";
      fullResponse += content;
      onStreamUpdate(content);
    }

    // Verificamos si hay una recomendación de doctor en la respuesta
    const recommendationMatch = fullResponse.match(
      /RECOMENDACIÓN DE ESPECIALIDAD:\s*([\wÁÉÍÓÚáéíóúñÑüÜ\s]+)/u
    );

    if (recommendationMatch && onDoctorRecommendation) {
      const specialtyName = recommendationMatch[1].trim();

      const specialty = specialties.find(
        (s) => s.name.toLowerCase() === specialtyName.toLowerCase()
      );

      if (specialty) {
        const doctors = await fetchDoctorsBySpecialty(specialty.id);

        if (doctors.length > 0) {
          // Seleccionar un doctor aleatorio de la lista
          const randomIndex = Math.floor(Math.random() * doctors.length);
          onDoctorRecommendation(doctors[randomIndex]);

          // Añadir mensaje sobre el doctor encontrado
          onStreamUpdate(
            "\n\n¡Buenas noticias! He encontrado un especialista que puede ayudarte. Dale click al botón al lado de enviar para ver los datos del doctor"
          );
        } else {
          // Añadir mensaje cuando no hay doctores disponibles
          onStreamUpdate(
            "\n\nEn este momento no hay especialistas en " +
              specialtyName +
              " disponibles en nuestra base de datos. Te recomendamos contactar directamente con tu centro de salud más cercano para que te deriven con un especialista adecuado."
          );
          onDoctorRecommendation(null);
        }
      } else {
        // Añadir mensaje cuando no se encuentra la especialidad
        onStreamUpdate(
          `\n\nLa especialidad "${specialtyName}" no está disponible en nuestro sistema. Por favor, consulta con tu médico de cabecera para una derivación apropiada.`
        );
        onDoctorRecommendation(null);
      }
    }
  } catch (error: any) {
    console.error("Error al obtener la respuesta de OpenAI: ", error);
    throw new Error("Error al obtener la respuesta de OpenAI");
  }
};

export const iniciarChat = async (conversationHistory: any[] = []) => {
  const specialties = await getSpecialties();
  const specialtiesList = specialties.map((s) => s.name).join(", ");

  const initialSystemMessage = {
    role: "system",
    content: `Eres un chatbot llamado AlivIA, principalmente los usuarios serán de Perú, especializado en asistencia virtual de salud. Tu principal función es ayudar a los usuarios a identificar posibles diagnósticos preliminares basados en los síntomas que describan y recomendar médicos.

      Las especialidades disponibles son: ${specialtiesList}. Solo debes recomendar especialidades de esta lista.
      
      Cuando un usuario menciona síntomas, tu trabajo es:
      1. Hacer preguntas claras y específicas basadas en los síntomas mencionados.
      2. Asegurarte de obtener suficiente información antes de dar cualquier recomendación.
      3. Cuando estés seguro de qué tipo de especialista necesita el usuario, debes incluir al final de tu mensaje una línea que comience exactamente con "RECOMENDACIÓN DE ESPECIALIDAD:" seguida de la especialidad requerida. Por ejemplo: "RECOMENDACIÓN DE ESPECIALIDAD:Cardiología"
      
      Recuerda:
      - Sé amable y profesional en tus respuestas
      - Si un usuario menciona temas off-topic, recuérdales tu función principal
      - Proporciona información relevante
      - Recuerda a los usuarios que deben consultar a un profesional de la salud
      - Solo incluye RECOMENDACIÓN DE ESPECIALIDAD cuando estés seguro de la especialidad necesaria
      - La recomendación debe ir en la última línea de tu respuesta
      - Hacer preguntas una por una, para no sobrecargar de preguntas al usuario, y no hostigarlo o hacer que se olvide responder ciertas preguntas si son preguntadas todas en el mismo mensaje, trata de preguntar puntualmente y la pregunta qte permita obtener más información, pero solo una por mensaje.
      
      En caso te pregunten otra cosa, responde amablemente pero recuérdales que tu función principal es ayudar con diagnósticos preliminares.`,
  };

  return [initialSystemMessage, ...conversationHistory];
};
