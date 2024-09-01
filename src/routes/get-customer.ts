import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../libs/prisma";
import { ClientError } from "../errors/client-error";


export async function getCustomer(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/:customerId/list', {
    schema: {
      params: z.object({
        customerId: z.string(),
      }),
      querystring: z.object({
        measure_type: z.string().optional(), 
      }),
    },
  },
  async(request) => {
    const { customerId } = request.params
    const measureType = request.query?.measure_type?.toUpperCase()
 
    // validação measure_type
    if(measureType && !['WATER', 'GAS'].includes(measureType)) {
      throw new ClientError('Tipo de medição não permitida')
    }

    const filter: Record<string, any> = {
      customer_code: customerId,
    };

    // Add measureType to filter if it's provided and valid
    if (measureType) {
      filter.measure_type = measureType;
    }

    const customer = await prisma.measure.findMany({
      select: {
        id: true,
        measure_datetime: true,
        measure_type: true,
        has_confirmed: true,
        image_url: true,
      },
      where: filter
    });

    if(customer.length === 0) {
      throw new ClientError('Nenhuma leitura encontrada')
    }

    return { customer }
  })
}