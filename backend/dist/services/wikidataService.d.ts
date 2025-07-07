interface WikidataChef {
    chef: string;
    chefLabel: string;
    description?: string | undefined;
    nationality?: string | undefined;
    birthDate?: string | undefined;
}
export declare class WikidataService {
    private readonly sparqlEndpoint;
    private readonly TIMEOUT;
    private readonly CACHE_TTL;
    private readonly MAX_FAILURES;
    private readonly FAILURE_WINDOW;
    private cache;
    private failures;
    private isCircuitOpen;
    searchChefs(query: string, limit?: number): Promise<string[]>;
    private searchChefsSimple;
    getChefDetails(chefName: string): Promise<WikidataChef | null>;
    searchChefsByCuisine(cuisine: string, limit?: number): Promise<string[]>;
    private extractChefName;
    private normalizeForSearch;
    private isValidPersonName;
    private searchChefsWithRegex;
    private isCircuitBroken;
    private recordFailure;
}
export declare const wikidataService: WikidataService;
export {};
//# sourceMappingURL=wikidataService.d.ts.map