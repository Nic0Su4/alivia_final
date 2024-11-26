import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, //SE PONE LA LLAVE
  dangerouslyAllowBrowser: true,
});

export default openai;
