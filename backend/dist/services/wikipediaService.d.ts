export interface WikipediaSearchResult {
    title: string;
    description?: string;
    excerpt?: string;
}
export declare class WikipediaService {
    private readonly baseUrl;
    searchChefs(query: string, limit?: number): Promise<string[]>;
    searchCuisines(query: string, limit?: number): Promise<string[]>;
    searchDishes(query: string, limit?: number): Promise<string[]>;
    searchIngredients(query: string, limit?: number): Promise<string[]>;
    private isLikelyChef;
    private isLikelyCuisine;
    private isLikelyDish;
    private isLikelyIngredient;
    private extractChefName;
    private extractCuisineName;
    private extractDishName;
    private extractIngredientName;
    private verifyIsChef;
    getChefDetails(chefName: string): Promise<WikipediaSearchResult | null>;
    private isValidDishName;
    private isValidCuisineName;
    private isValidIngredientName;
    private containsQuery;
    private sortByRelevance;
}
export declare const wikipediaService: WikipediaService;
//# sourceMappingURL=wikipediaService.d.ts.map