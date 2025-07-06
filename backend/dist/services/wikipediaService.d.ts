export interface WikipediaSearchResult {
    title: string;
    description?: string;
    excerpt?: string;
}
export declare class WikipediaService {
    private readonly baseUrl;
    searchChefs(query: string, limit?: number): Promise<string[]>;
    private isLikelyChef;
    private extractChefName;
    getChefDetails(chefName: string): Promise<WikipediaSearchResult | null>;
}
export declare const wikipediaService: WikipediaService;
//# sourceMappingURL=wikipediaService.d.ts.map