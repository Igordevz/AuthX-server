import swaggerAutogen from "swagger-autogen"

const doc = {
  info: {
    title: "Minha API",
    description: "Documentação gerada automaticamente 🚀",
  },
  host: "localhost:3000",
  schemes: ["http"],
}

const outputFile = "./swagger-output.json"
const endpointsFiles = ["./src/router/router.ts"] // ou o arquivo principal das rotas

swaggerAutogen()(outputFile, endpointsFiles, doc)
