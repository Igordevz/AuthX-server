import OpenAI from "openai";
import fs from "fs";
import axios from "axios";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const swagger = JSON.parse(
  fs.readFileSync("./src/docs/swagger-output.json", "utf-8")
);

// Função para chamar a API
async function callEndpoint(path: string, method: string) {
  const url = `http://localhost:3000${path}`;

  try {
    // Para métodos POST ou DELETE você pode enviar um body de teste se necessário
    const response = await axios({
      url,
      method: method as any,
      // body de teste (ajuste conforme suas rotas)
      data: method.toLowerCase() !== "get" ? { test: "valor" } : undefined,
      validateStatus: () => true, // não lança erro para status != 2xx
    });
    return response.data;
  } catch (err: any) {
    return { error: err.message };
  }
}

async function enrichSwagger() {
  for (const path in swagger.paths) {
    for (const method in swagger.paths[path]) {
      const endpoint = swagger.paths[path][method];

      console.log(`🔄 Enriquecendo rota [${method.toUpperCase()}] ${path} ...`);

      // Chama o endpoint real
      const apiResponse = await callEndpoint(path, method);

      // Cria o prompt para a IA
      const prompt = `
Você é um especialista em documentação de APIs. Analise o seguinte endpoint:

Método: ${method.toUpperCase()}
Endpoint: ${path}
Parâmetros: ${JSON.stringify(endpoint.parameters || [])}
Exemplo de resposta real da API: ${JSON.stringify(apiResponse)}

Com base nisso, gere uma descrição clara, objetiva e fiel do que a rota faz, incluindo:
- O que a rota retorna
- Possíveis erros
- Observações importantes
`;

      // Chama a IA
      const completion = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      });

      endpoint.description = completion.choices[0].message.content;

      console.log(`✅ Rota [${method.toUpperCase()} ${path}] enriquecida`);
    }
  }

  // Salva o Swagger atualizado
  fs.writeFileSync(
    "./src/docs/swagger-IA.json",
    JSON.stringify(swagger, null, 2)
  );
  console.log("🎉 swagger-IA.json gerado com sucesso!");
}

enrichSwagger();
