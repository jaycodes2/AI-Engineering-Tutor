import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION_CHAT } from "../constants.js";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lessonGenerationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.OBJECT,
        properties: {
            lesson: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A concise, engaging title for the lesson." },
                    explanation: { type: Type.STRING, description: "A detailed but easy-to-understand explanation of the concept for an engineering student. Use markdown for formatting." },
                    imagePrompt: { type: Type.STRING, description: "A detailed, descriptive prompt for an image generation model to create a visual aid for this lesson. E.g., 'A vibrant, detailed diagram of the Carnot Cycle with clear labels for each stage.'" },
                },
                required: ["title", "explanation", "imagePrompt"],
            },
            quiz: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "A multiple-choice question to test understanding of the lesson." },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        minItems: 4,
                        maxItems: 4,
                        description: "An array of 4 possible answers."
                    },
                    correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
                    explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is correct." }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"],
            }
        },
        required: ["lesson", "quiz"],
    },
};

export const generateLessonAndQuiz = async (topic, difficulty) => {
    const prompt = `Generate a lesson and a quiz question about "${topic}" for an engineering student at the "${difficulty}" level. The explanation should be clear and use analogies if possible. The quiz must have exactly 4 options.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: lessonGenerationConfig,
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateImage = async (prompt) => {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed.");
};


export const sendMessageToTutor = async (history, newMessage) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: INITIAL_SYSTEM_INSTRUCTION_CHAT,
        },
        history,
    });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
};

const titleAndSuggestionConfig = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A short, concise title for the chat conversation (3-5 words)." },
            topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 3-4 related engineering topics suggested by the conversation."
            }
        },
        required: ["title", "topics"],
    },
};

export const generateTitleAndSuggestions = async (history) => {
    const conversation = history.map(msg => `${msg.role}: ${msg.text}`).join('\n');
    const prompt = `Based on the following conversation, generate a short title (3-5 words) for the chat and suggest 3-4 related engineering topics for further study.

Conversation:
${conversation}

Provide the output in the specified JSON format.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: titleAndSuggestionConfig,
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};