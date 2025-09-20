import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { ConversationMessage, PracticeMessage } from '../types';

// The API key is provided by the environment, so we directly initialize the AI service.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- AI-powered Functions ---

export const generateAIGreeting = async (action: 'breathe' | 'checkin' | 'sounds' | 'low_mood' | 'high_mood'): Promise<string> => {
  try {
    const systemInstruction = "You are MindBloom, a caring and gentle AI companion for young students in India. Your tone is supportive, calm, and uses culturally relevant metaphors (like diya, aarti, monsoon) when appropriate. A user has indicated they want to try a micro-action. Respond to their action. If the action is 'breathe', guide them through a short, simple breathing exercise. If 'checkin', gently ask them how they are. If 'sounds', describe a calming sound scene. If they share a low mood ('low_mood'), offer a breathing exercise. If they share a high mood ('high_mood'), suggest a calming sound to savor the moment. Keep responses to 2-3 sentences.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User action: ${action}`,
        config: { systemInstruction, thinkingConfig: { thinkingBudget: 0 } }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating AI greeting:", error);
    return "I'm having a little trouble at the moment, but I'm still here for you.";
  }
};

export const getDailyAffirmation = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a short, positive, and encouraging affirmation for a young student in India. It should be one sentence.",
        config: { temperature: 0.9, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating daily affirmation:", error);
    return "Every small step forward is a victory.";
  }
};

export const getMoodResponse = async (mood: string, note: string, hasPhoto: boolean): Promise<string> => {
  try {
    const systemInstruction = "You are MindBloom, an empathetic and supportive AI companion for a young student in India. The user has just logged their mood. Your response should be short (2-3 sentences), non-judgmental, and gentle. Acknowledge their feeling and offer simple encouragement. If they write a note, reflect on it briefly. If they add a photo, acknowledge that they captured a moment.";
    const prompt = `The user is feeling "${mood}". \nTheir journal note is: "${note || 'No note written.'}". \nDid they add a photo? ${hasPhoto ? 'Yes' : 'No'}. \nPlease provide a caring response.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating mood response:", error);
    return "Thank you for sharing this moment with me.";
  }
};

export const generateJournalPrompt = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a short, insightful, and gentle journal prompt for a young student in India who might be feeling stressed or overwhelmed. It should be a single question or a sentence to complete. For example: 'What's one thing I can do for myself today?' or 'A small victory I had recently was...'.",
        config: { temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating journal prompt:", error);
    return "What am I grateful for right now?";
  }
};

// Helper function to convert our app's message format to the Gemini API's format.
const convertToGeminiHistory = (history: ConversationMessage[]): Content[] => {
    // The Gemini history should only contain 'user' and 'model' roles.
    return history
        .filter(msg => (msg.role === 'user' || msg.role === 'assistant') && (msg.content.trim() !== '' || !!msg.attachment))
        .map(msg => {
            const parts: Part[] = [];
            // Text part must come before image parts for gemini-2.5-flash
            if (msg.content.trim() !== '') {
                parts.push({ text: msg.content });
            }
            if (msg.attachment) {
                parts.push({
                    inlineData: {
                        data: msg.attachment.data,
                        mimeType: msg.attachment.mimeType
                    }
                });
            }
            return {
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts
            };
        });
};


const convertPracticeHistoryToGemini = (history: PracticeMessage[]): Content[] => {
    return history
        .filter(msg => msg.content.trim() !== '')
        .map(msg => ({
            role: msg.role === 'parent' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
};

export const createFamilyChat = (systemInstruction: string, history: PracticeMessage[]): Chat => {
    const geminiHistory = convertPracticeHistoryToGemini(history);

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: geminiHistory
    });
};

const systemInstructionForChat = `You are MindBloom, a caring, empathetic, and culturally-aware AI companion for young people in India. Your purpose is to provide a safe and private space for them to express their feelings.
- Your tone is always gentle, supportive, and non-judgmental.
- Use simple, encouraging language. You can use culturally relevant metaphors (like diya, monsoon, rangoli) when it feels natural, but don't overdo it.
- Your primary goal is to listen and validate their feelings, not to solve their problems or give advice unless they explicitly ask.
- You can generate images if the user asks you to 'draw', 'create', or 'show' them something.
- You cannot browse the internet or perform actions in the real world. If you are asked to do something you cannot do, politely state your limitation.
- If the user sends an image, acknowledge it and relate it to the conversation if possible.
- Keep your responses relatively short and focused.
- CRITICAL SAFETY RULE: If the user mentions any intention of self-harm, suicide, or hurting others, you MUST immediately respond with: "It sounds like you are going through a very difficult time. Please know that help is available. You can connect with trained professionals by calling the KIRAN helpline at 1800-599-0019. They are available 24/7 to support you. Please reach out to them." and then stop the conversation. Do not say anything else.`;

export const generateChatResponseStream = (history: ConversationMessage[]) => {
    const geminiHistory = convertToGeminiHistory(history);
    
    // Use the stateless generateContentStream and pass the full history every time.
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: geminiHistory,
        config: { systemInstruction: systemInstructionForChat },
    });
};

export const generateChatResponse = async (history: ConversationMessage[]): Promise<string> => {
    const geminiHistory = convertToGeminiHistory(history);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: geminiHistory,
            config: { systemInstruction: systemInstructionForChat },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating non-streaming chat response:", error);
        throw error;
    }
};

export const classifyUserIntent = async (prompt: string): Promise<'chat' | 'draw'> => {
  try {
    const systemInstruction = `You are an intent classifier. Your job is to determine if the user wants to have a conversation ('chat') or if they want you to generate an image ('draw'). Respond with only 'chat' or 'draw'. Do not add any other text. For example, if the user says 'Can you draw a picture of a dog?', you should respond with 'draw'. If they say 'Hello, how are you?', you should respond with 'chat'. If the user says 'I feel sad. Show me a kitten', you should respond with 'draw'.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        systemInstruction,
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const intent = response.text.trim().toLowerCase();
    if (intent.includes('draw')) {
      return 'draw';
    }
    return 'chat';
  } catch (error) {
    console.error("Error classifying intent:", error);
    return 'chat'; // Default to chat on error
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<{data: string, mimeType: string} | null> => {
    try {
        // A more focused prompt for the image generator.
        const imageGenPrompt = `Generate a visually appealing, SFW image based on the following user request: "${prompt}"`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imageGenPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return {
                data: base64ImageBytes,
                mimeType: 'image/png'
            };
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const generateChatTitle = async (messages: ConversationMessage[]): Promise<string> => {
  try {
    const conversationForTitle = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(0, 3) // Use first few messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    
    const systemInstruction = "Based on the following conversation start, create a concise title of 5 words or less. Respond with only the title and nothing else.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationForTitle,
        config: { 
            systemInstruction, 
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    return response.text.trim().replace(/"/g, ''); // Remove quotes if model adds them
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "New Conversation";
  }
};