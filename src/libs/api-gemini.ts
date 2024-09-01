import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { readFileSync } from 'fs';
import path from 'path';
import { env } from "../env";
import { ClientError } from '../errors/client-error';
import { prisma } from './prisma';
import fs from 'fs'

// Initialize GoogleAIFileManager with your API_KEY.
const geradorIA = new GoogleGenerativeAI(env.API_KEY);
const fileManager = new GoogleAIFileManager(env.API_KEY);

export const processAndStoreImage = async(imageName: string, customerCode: string, measureType: string, measureDatetime: Date) => {
   try {
      //caminho completo da imagem
      const imagePath = path.join(__dirname, '..', '..', imageName)
      const imageBuffer = readFileSync(imageName)

      // Verificar se o arquivo existe antes de lê-lo
      if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
        throw new ClientError(`O arquivo ${imagePath} não existe ou não é um arquivo.`);
      }

      // Fazendo upload da imagem para o Gemini AI
      const uploadResult = await fileManager.uploadFile(imagePath, {
        mimeType: 'image/jpeg',
        displayName: imageName,
      });
      
      console.log(`Enviando arquivo ${uploadResult.file.displayName} de ${uploadResult.file.uri}`)

      // Gerando conteúdo
      const model = geradorIA.getGenerativeModel({ model: 'gemini-1.5-flash'})
      const result = await model.generateContent([
        'Descreva a imagem',
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType
          },
        },
      ]);

      const extractedValue = result.response.text();

      // Armazenando os resultados no banco de dados usando prisma
      const storeMeasure = await prisma.measure.create({
        data: {
          customer_code: customerCode,
          measure_datetime: measureDatetime,
          measure_type: measureType,
          measure_value: parseFloat(extractedValue),
          has_confirmed: false,
          image_url: uploadResult.file.uri,
        },
      });

      console.log('Stored Measure: ', storeMeasure);
      return storeMeasure
      
   } catch (error) {
     console.log(error);
    
     throw new ClientError('Erro ao processar e armazenar a imagem.');
   }
}
