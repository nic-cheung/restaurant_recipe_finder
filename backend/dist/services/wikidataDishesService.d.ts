declare class WikidataDishesService {
    private readonly WIKIDATA_ENDPOINT;
    private readonly TIMEOUT;
    private readonly CACHE_TTL;
    private readonly MAX_FAILURES;
    private readonly FAILURE_WINDOW;
    private cache;
    private failures;
    private isCircuitOpen;
    getDishSuggestions(query: string): Promise<string[]>;
    private searchSimple;
    private executeSimpleQuery;
    private createAccentVariations;
    private executeSparqlQuery;
    private recordFailure;
    private isCircuitBroken;
    clearCache(): void;
}
export declare const wikidataDishesService: WikidataDishesService;
export {};
//# sourceMappingURL=wikidataDishesService.d.ts.map