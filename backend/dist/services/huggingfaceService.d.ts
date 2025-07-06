export declare class HuggingFaceService {
    private apiKey;
    private baseUrl;
    constructor();
    private generateText;
    suggestChefs(query: string): Promise<string[]>;
    suggestRestaurants(query: string): Promise<string[]>;
    suggestIngredients(query: string): Promise<string[]>;
    suggestCuisines(query: string): Promise<string[]>;
    suggestDishes(query: string): Promise<string[]>;
    private getFallbackChefs;
    private getFallbackRestaurants;
    private getFallbackIngredients;
    private getFallbackCuisines;
    private getFallbackDishes;
}
export declare const huggingfaceService: HuggingFaceService;
//# sourceMappingURL=huggingfaceService.d.ts.map