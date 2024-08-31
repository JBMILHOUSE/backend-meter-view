import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { env } from "../env";
import path from 'path';
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs';

// Initialize GoogleAIFileManager with your API_KEY.
const geradorIA = new GoogleGenerativeAI(env.API_KEY);
export const fileManager = new GoogleAIFileManager(env.API_KEY);

// Função que faz upload de um arquivo para o Gemini
export async function enviarParaGemini(imagemBase64: string, nomeExibicao: string) {  
    
    // Decodificar a imagem base64 para um Buffer
    const buffer = Buffer.from(imagemBase64, 'base64');
    
    // Criar um caminho temporário para salvar o arquivo
    const caminhoTemporario = path.join(__dirname, `temp_${uuidv4()}.jpg`);
    
    // Salvar o Buffer como um arquivo temporário
    fs.writeFileSync(caminhoTemporario, buffer);

    try {
        const fileType = await import('file-type');
        // Determinar o tipo MIME usando a biblioteca file-type
        const tipo = await fileType.fileTypeFromBuffer(buffer);

        const resultadoUpload = await fileManager.uploadFile("conta-sincred.png", {
            mimeType: tipo?.mime || 'image/png', // Usar o tipo inferido ou um padrão
            displayName: nomeExibicao,
        });

        const arquivo = resultadoUpload.file;
        console.log(`Arquivo enviado ${arquivo.displayName} como: ${arquivo.name}`);
        return arquivo.uri;
    } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
        // Adicionar tratamento de erro personalizado aqui
        throw error;
    } finally {
        // Remover o arquivo temporário
        fs.unlinkSync(caminhoTemporario);
    }
}
  
// Função para extrair o valor da imagem usando a IA do Gemini
export async function extrairValorDaImagem(uriArquivo: string): Promise<number> {
    const modelo = geradorIA.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const configuracaoGeracao = {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
        responseMimeType: "text/plain",
    };

    const partes = [
        { text: "Descreve a imagem." },
        // { text: "Tipo da conta." },
        // { text: "Data da próxima leitura." },
        {
            fileData: {
                mimeType: uriArquivo.split('.').pop()?.toLowerCase() || 'application/octet-stream',
                fileUri: uriArquivo,
            },
        },
    ];

   try {
    const resultado = await modelo.generateContent({
        contents: [{ role: "user", parts: partes }],
        generationConfig: configuracaoGeracao,
    });

    const textoExtraido = resultado.response.text()

    const valorNumerico = parseFloat(textoExtraido.replace(/\D/g, ''))

    if (isNaN(valorNumerico)) {
        throw new Error('Não foi possível extrair um valor numérico válido da imagem.');
    }

    return valorNumerico;

   } catch (error) {
    console.error('Erro ao extrair valor da imagem:', error);
    throw new Error('Erro ao processar a imagem.');
   }
}