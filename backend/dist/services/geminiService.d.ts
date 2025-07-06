export declare class GeminiService {
    private genAI;
    private model;
    constructor();
    private generateText;
    suggestChefs(query: string, context?: any): Promise<string[]>;
    suggestRestaurants(query: string, context?: any): Promise<string[]>;
    suggestIngredients(query: string, context?: any): Promise<string[]>;
    suggestCuisines(query: string, context?: any): Promise<string[]>;
    suggestDishes(query: string, context?: any): Promise<string[]>;
    generateRecipe(prompt: string): Promise<string>;
}
export declare const geminiService: GeminiService;
//# sourceMappingURL=geminiService.d.ts.map