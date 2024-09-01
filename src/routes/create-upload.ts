import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { processAndStoreImage } from "../libs/api-gemini";
import { prisma } from "../libs/prisma";

export async function createUpload(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/upload', {
    schema: {
        body: z.object({
           image: z.string(),
           customer_code: z.string(),
           measure_datetime: z.coerce.date(),
           measure_type: z.enum(['WATER', 'GAS'])

        })
    },
  }, async (request, reply) => {
    
    const { image, customer_code, measure_datetime, measure_type } = request.body

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
      return reply.code(409).send({ message: 'Leitura do mês já realizada' })
    }

    try {  
        const measureStored = await processAndStoreImage(image, customer_code, measure_type, new Date(measure_datetime))  
        reply.send(measureStored)  
    
    } catch (error) {
      return reply.code(500).send({ message: 'Erro ao processar a imagem. '})
    }
  });
}