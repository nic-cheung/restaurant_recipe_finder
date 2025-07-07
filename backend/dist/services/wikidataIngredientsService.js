"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikidataIngredientsService = void 0;
function normalizeForMatching(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function capitalizeWords(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
class WikidataIngredientsService {
    constructor() {
        this.WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
        this.TIMEOUT = 5000;
        this.CACHE_TTL = 300000;
        this.MAX_FAILURES = 3;
        this.FAILURE_WINDOW = 60000;
        this.cache = new Map();
        this.failures = [];
        this.isCircuitOpen = false;
    }
    async getIngredientSuggestions(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const normalizedQuery = normalizeForMatching(query.trim());
        const cacheKey = `ingredient:${normalizedQuery}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log(`✓ Using cached ingredients for "${query}"`);
            return cached.data;
        }
        if (this.isCircuitBroken()) {
            console.log('⚠️ Circuit breaker open, skipping Wikidata ingredients call');
            return [];
        }
        try {
            const results = await this.searchSimple(normalizedQuery);
            this.cache.set(cacheKey, {
                data: results,
                timestamp: Date.now()
            });
            this.failures = [];
            this.isCircuitOpen = false;
            console.log(`✓ Found ${results.length} ingredients from Wikidata for "${query}"`);
            return results;
        }
        catch (error) {
            console.error(`❌ Wikidata ingredients error for "${query}":`, error);
            this.recordFailure();
            return [];
        }
    }
    async searchSimple(query) {
        const strategies = [
            () => this.searchByOpenFoodFactsId(query),
            () => this.executeSimpleQuery(query, 'exact'),
            () => this.executeSimpleQuery(query, 'partial')
        ];
        for (const strategy of strategies) {
            try {
                const results = await strategy();
                if (results.length > 0) {
                    return results;
                }
            }
            catch (error) {
                console.log('Strategy failed, trying next:', error);
                continue;
            }
        }
        return [];
    }
    async searchByOpenFoodFactsId(query) {
        const offIdFormat = query.toLowerCase().replace(/\s+/g, '-');
        const sparqlQuery = `
      SELECT DISTINCT ?ingredient ?ingredientLabel WHERE {
        ?ingredient wdt:P5930 "${offIdFormat}" .
        ?ingredient rdfs:label ?ingredientLabel .
        FILTER(LANG(?ingredientLabel) IN ("en"))
      }
      LIMIT 5
    `;
        return this.executeSparqlQuery(sparqlQuery);
    }
    async executeSimpleQuery(query, type) {
        const accentVariations = this.createAccentVariations(query);
        let sparqlQuery;
        if (type === 'exact') {
            const exactFilters = accentVariations.map(variant => `LCASE(?ingredientLabel) = "${variant}"`).join(' || ');
            sparqlQuery = `
        SELECT DISTINCT ?ingredient ?ingredientLabel WHERE {
          # Focus on ingredients with Open Food Facts IDs (most reliable and faster)
          ?ingredient wdt:P5930 ?offId .
          ?ingredient rdfs:label ?ingredientLabel .
          FILTER(LANG(?ingredientLabel) IN ("en"))
          FILTER(${exactFilters})
        }
        ORDER BY ?ingredientLabel
        LIMIT 10
      `;
        }
        else {
            const partialFilters = accentVariations.map(variant => `CONTAINS(LCASE(?ingredientLabel), "${variant}")`).join(' || ');
            sparqlQuery = `
        SELECT DISTINCT ?ingredient ?ingredientLabel WHERE {
          # Focus on ingredients with Open Food Facts IDs (most reliable and faster)
          ?ingredient wdt:P5930 ?offId .
          ?ingredient rdfs:label ?ingredientLabel .
          FILTER(LANG(?ingredientLabel) IN ("en"))
          FILTER(${partialFilters})
        }
        ORDER BY ?ingredientLabel
        LIMIT 10
      `;
        }
        return this.executeSparqlQuery(sparqlQuery);
    }
    createAccentVariations(query) {
        const normalized = query.toLowerCase();
        const variations = [normalized];
        const accentMap = {
            'a': ['à', 'á', 'â', 'ã', 'ä', 'å'],
            'e': ['è', 'é', 'ê', 'ë'],
            'i': ['ì', 'í', 'î', 'ï'],
            'o': ['ò', 'ó', 'ô', 'õ', 'ö'],
            'u': ['ù', 'ú', 'û', 'ü'],
            'n': ['ñ'],
            'c': ['ç']
        };
        for (const [base, accents] of Object.entries(accentMap)) {
            if (normalized.includes(base)) {
                for (const accent of accents) {
                    variations.push(normalized.replace(new RegExp(base, 'g'), accent));
                }
            }
        }
        variations.push(query.toLowerCase());
        return [...new Set(variations)];
    }
    async executeSparqlQuery(sparqlQuery) {
        const url = `${this.WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'RecipeFinderBot/1.0 (https://github.com/your-repo; your-email@example.com)'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const ingredients = data.results.bindings.map(binding => capitalizeWords(binding.ingredientLabel.value));
            return [...new Set(ingredients)].slice(0, 10);
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Wikidata ingredients request timed out');
            }
            throw error;
        }
    }
    recordFailure() {
        const now = Date.now();
        this.failures.push(now);
        this.failures = this.failures.filter(timestamp => now - timestamp < this.FAILURE_WINDOW);
        if (this.failures.length >= this.MAX_FAILURES) {
            this.isCircuitOpen = true;
            console.log('⚠️ Circuit breaker opened due to repeated failures');
            setTimeout(() => {
                this.isCircuitOpen = false;
                this.failures = [];
                console.log('✓ Circuit breaker reset');
            }, this.FAILURE_WINDOW);
        }
    }
    isCircuitBroken() {
        return this.isCircuitOpen;
    }
    clearCache() {
        this.cache.clear();
        console.log('✓ Wikidata ingredients cache cleared');
    }
}
exports.wikidataIngredientsService = new WikidataIngredientsService();
//# sourceMappingURL=wikidataIngredientsService.js.map