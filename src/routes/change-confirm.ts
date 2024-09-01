import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../libs/prisma";
import { ClientError } from "../errors/client-error";

export async function changeConfirm(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch('/confirm', {
    schema: {
        body: z.object({
           measureId: z.string(),
           confirmedValue: z.number(),
        }),
    }
  }, async (request, reply) => {

    const { measureId, confirmedValue } = request.body

    try {
      const isMeasure = await prisma.measure.findUnique({
        where: { id: measureId },
      })
  
      if(!isMeasure) {
        throw new ClientError('Medição não encontrada')
      }
  
      if(isMeasure.measure_value) {
         throw new ClientError('Medição já foi confirmada')
      }
  
      await prisma.measure.update({
        where: { id: measureId },
        data: {
          has_confirmed: true,
          measure_value: confirmedValue,
        },
      })
  
      return reply.send({ sucess: true })
    } catch (error) {
       throw new ClientError('Erro ao confirmar a medição')
    }
  })
}