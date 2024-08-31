import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../libs/prisma";
import { enviarParaGemini, extrairValorDaImagem, fileManager } from "../libs/api-gemini";

export async function createUpload(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/upload', {
    schema: {
        body: z.object({
           image: z.string(),
           customer_code: z.string(),
           measure_datetime: z.coerce.date(),
           measure_type: z.enum(['Water', 'Gas'])

        })
    },
  }, async (request, reply) => {
    
    const { image, customer_code, measure_datetime, measure_type } = request.body

     // valida o tipo de dados dos parâmetros enviados(incluise o base64)
     // verificar se já existe uma leitura no mês naquele tipo de leitura.
    const existingMeasure = await prisma.measure.findFirst({
       where: {
            customer_code,
            measure_datetime: {
              gte: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth(), 1),
              lte: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth() + 1, 1)
            },
            measure_type,
        },
    });

    if(existingMeasure) {
      return reply.code(409).send({ error_description: 'Leitura do mês já realizada' })
    }

    try {      
        const imageUrl = await enviarParaGemini(image, `imagem_${customer_code}_${Date.now()}`)
    
        // Extrair o valor numérico da imagem usando a função extractValueFromImage
        const extractedValue = await extrairValorDaImagem(imageUrl)
    
       console.log('extraindo valor ', extractedValue)
       const newMeasure = await prisma.measure.create({ 
        data: {
            customer_code,
            measure_datetime,
            measure_type,
            image_url: imageUrl,
            measure_value: extractedValue
         }
       })

       return reply.code(201).send({
        imageUrl,
        measure_value: newMeasure.measure_value
       })

    } catch (error) {
      return reply.code(500).send({ error_description: 'Erro ao processar a imagem. '})
    }
     // integrar com uma API de LLM para extrair o valor da imagem
  });
}