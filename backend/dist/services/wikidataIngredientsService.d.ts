declare class WikidataIngredientsService {
    private readonly WIKIDATA_ENDPOINT;
    private readonly TIMEOUT;
    private readonly CACHE_TTL;
    private readonly MAX_FAILURES;
    private readonly FAILURE_WINDOW;
    private cache;
    private failures;
    private isCircuitOpen;
    getIngredientSuggestions(query: string): Promise<string[]>;
    private searchSimple;
    private searchByOpenFoodFactsId;
    private executeSimpleQuery;
    private createAccentVariations;
    private executeSparqlQuery;
    private recordFailure;
    private isCircuitBroken;
    clearCache(): void;
}
export declare const wikidataIngredientsService: WikidataIngredientsService;
export {};
//# sourceMappingURL=wikidataIngredientsService.d.ts.map