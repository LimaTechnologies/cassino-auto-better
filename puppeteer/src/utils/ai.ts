import axios from 'axios';

/**
 * Identifica a presença de um objeto específico em uma imagem composta por 9 quadros (3x3),
 * utilizando o modelo "lavva" do Ollama.
 * 
 * @param imageUrl URL da imagem composta (3x3)
 * @param targetObject Descrição do objeto a ser identificado em cada quadro
 * @returns A resposta do modelo com a análise dos 9 quadros
 */
export async function identifyObjectInImageGrid(imageUrl: string, targetObject: string): Promise<string> {
    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');

        const prompt = `
Você está vendo uma imagem composta por 9 quadros (3 colunas x 3 linhas).
Cada quadro é uma imagem individual, numerada da esquerda para a direita, de cima para baixo (1 a 9).

Seu objetivo é verificar em quais quadros aparece o seguinte objeto:

👉 **${targetObject.trim()}**

Responda no seguinte formato:

1. ✅ ou ❌ — breve justificativa
2. ✅ ou ❌ — breve justificativa
...
9. ✅ ou ❌ — breve justificativa

Se não tiver certeza, diga ❌.
`;

        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'lavva',
                prompt: prompt,
                images: [imageBase64],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.response.trim();
    } catch (error: any) {
        throw new Error(`Erro na verificação de imagem: ${error.message}`);
    }
}
