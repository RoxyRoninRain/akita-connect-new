import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// In a real app, this would come from import.meta.env.VITE_GEMINI_API_KEY
const API_KEY = 'YOUR_API_KEY_HERE';

// Mock responses for when API key is missing
const MOCK_RESPONSES = {
    expert: "As an Akita expert, I can tell you that Akitas are loyal, dignified, and courageous. They require firm, consistent training and early socialization.",
    bio: "A majestic Akita with a heart of gold. Loyal to the core and always ready for an adventure.",
};

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    async askAkitaExpert(question: string): Promise<string> {
        if (!this.model) {
            console.warn('Gemini API key not configured. Using mock response.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MOCK_RESPONSES.expert;
        }

        try {
            const prompt = `You are an expert on the Akita dog breed. Answer the following question with authority, focusing on breed standard, temperament, and history. Question: ${question}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error calling Gemini:', error);
            return "I'm having trouble connecting to the Akita knowledge base right now.";
        }
    }

    async generateAkitaBio(name: string, traits: string[]): Promise<string> {
        if (!this.model) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MOCK_RESPONSES.bio;
        }

        try {
            const prompt = `Write a short, engaging bio (max 50 words) for an Akita dog named ${name}. Key traits: ${traits.join(', ')}.`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error calling Gemini:', error);
            return MOCK_RESPONSES.bio;
        }
    }

    // Placeholder for image generation (requires different model/API usually)
    async generateLitterImage(_description: string): Promise<string> {
        // Mocking this as it requires Imagen or specific endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&q=80&w=800";
    }
}

export const geminiService = new GeminiService();
