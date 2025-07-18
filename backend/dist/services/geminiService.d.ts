export declare class GeminiService {
    private genAI;
    private model;
    private isUsingOAuth;
    constructor();
    private initializeClient;
    private ensureValidClient;
    private generateText;
    private generateTextWithOAuth;
    suggestChefs(query: string, context?: any): Promise<string[]>;
    suggestRestaurants(query: string, context?: any): Promise<string[]>;
    suggestIngredients(query: string, context?: any): Promise<string[]>;
    suggestCuisines(query: string, context?: any): Promise<string[]>;
    suggestDishes(query: string, context?: any): Promise<string[]>;
    generateRecipe(prompt: string): Promise<string>;
    private generateAIPromptForUser;
    private formatCleanPrompt;
    private formatPreferences;
    private formatRequirements;
    private formatTechnicalPrompt;
    private addPromptToResponse;
}
export declare const geminiService: GeminiService;
//# sourceMappingURL=geminiService.d.ts.map