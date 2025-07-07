interface WikidataIngredientResult {
  ingredient: {
    value: string;
  };
  ingredientLabel: {
    value: string;
  };
  offId?: {
    value: string;
  };
}

interface WikidataResponse {
  results: {
    bindings: WikidataIngredientResult[];
  };
}

interface CacheEntry {
  data: string[];
  timestamp: number;
}

/**
 * Normalize text for matching by removing accents and converting to lowercase
 */
function normalizeForMatching(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Capitalize each word in a string
 */
function capitalizeWords(text: string): string {
  return text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Reliable service for getting ingredient suggestions from Wikidata
 * Uses simplified queries, caching, and circuit breaker pattern
 */
class WikidataIngredientsService {
  private readonly WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
  private readonly TIMEOUT = 5000; // Reduced to 5 seconds
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_FAILURES = 3;
  private readonly FAILURE_WINDOW = 60000; // 1 minute
  
  private cache = new Map<string, CacheEntry>();
  private failures: number[] = [];
  private isCircuitOpen = false;

  /**
   * Get ingredient suggestions from Wikidata based on query
   */
  async getIngredientSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = normalizeForMatching(query.trim());
    const cacheKey = `ingredient:${normalizedQuery}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`✓ Using cached ingredients for "${query}"`);
      return cached.data;
    }

    // Check circuit breaker
    if (this.isCircuitBroken()) {
      console.log('⚠️ Circuit breaker open, skipping Wikidata ingredients call');
      return [];
    }

    try {
      // Use simple, fast query strategy
      const results = await this.searchSimple(normalizedQuery);
      
      // Cache successful results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
      
      // Reset failures on success
      this.failures = [];
      this.isCircuitOpen = false;
      
      console.log(`✓ Found ${results.length} ingredients from Wikidata for "${query}"`);
      return results;
      
    } catch (error) {
      console.error(`❌ Wikidata ingredients error for "${query}":`, error);
      this.recordFailure();
      return [];
    }
  }

  /**
   * Simple, fast search strategy - only search ingredients with Open Food Facts IDs
   */
  private async searchSimple(query: string): Promise<string[]> {
    // Try different search strategies in order of efficiency
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
      } catch (error) {
        console.log('Strategy failed, trying next:', error);
        continue;
      }
    }

    return [];
  }

  /**
   * Search by Open Food Facts ID pattern (fastest)
   */
  private async searchByOpenFoodFactsId(query: string): Promise<string[]> {
    // Convert query to Open Food Facts ID format (lowercase, spaces to hyphens)
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

  /**
   * Execute a simple SPARQL query for ingredients with Open Food Facts IDs
   */
  private async executeSimpleQuery(query: string, type: 'exact' | 'partial'): Promise<string[]> {
    // Create accent variations for better matching
    const accentVariations = this.createAccentVariations(query);
    
    let sparqlQuery: string;
    
    if (type === 'exact') {
      // Try exact matches with accent variations - focus on Open Food Facts items first
      const exactFilters = accentVariations.map(variant => 
        `LCASE(?ingredientLabel) = "${variant}"`
      ).join(' || ');
      
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
    } else {
      // Partial matches with accent variations - focus on Open Food Facts items first
      const partialFilters = accentVariations.map(variant => 
        `CONTAINS(LCASE(?ingredientLabel), "${variant}")`
      ).join(' || ');
      
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

  /**
   * Create accent variations for better matching
   */
  private createAccentVariations(query: string): string[] {
    const normalized = query.toLowerCase();
    const variations = [normalized];
    
    // Common accent mappings
    const accentMap: { [key: string]: string[] } = {
      'a': ['à', 'á', 'â', 'ã', 'ä', 'å'],
      'e': ['è', 'é', 'ê', 'ë'],
      'i': ['ì', 'í', 'î', 'ï'],
      'o': ['ò', 'ó', 'ô', 'õ', 'ö'],
      'u': ['ù', 'ú', 'û', 'ü'],
      'n': ['ñ'],
      'c': ['ç']
    };
    
    // Generate variations by replacing each character with its accented versions
    for (const [base, accents] of Object.entries(accentMap)) {
      if (normalized.includes(base)) {
        for (const accent of accents) {
          variations.push(normalized.replace(new RegExp(base, 'g'), accent));
        }
      }
    }
    
    // Also add the original query as-is (in case it already has accents)
    variations.push(query.toLowerCase());
    
    return [...new Set(variations)]; // Remove duplicates
  }

  /**
   * Execute SPARQL query with timeout and error handling
   */
  private async executeSparqlQuery(sparqlQuery: string): Promise<string[]> {
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

      const data = await response.json() as WikidataResponse;
      
      const ingredients = data.results.bindings.map(binding => 
        capitalizeWords(binding.ingredientLabel.value)
      );
      
      return [...new Set(ingredients)].slice(0, 10);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Wikidata ingredients request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(): void {
    const now = Date.now();
    this.failures.push(now);
    
    // Remove old failures outside the window
    this.failures = this.failures.filter(timestamp => now - timestamp < this.FAILURE_WINDOW);
    
    // Open circuit if too many failures
    if (this.failures.length >= this.MAX_FAILURES) {
      this.isCircuitOpen = true;
      console.log('⚠️ Circuit breaker opened due to repeated failures');
      
      // Auto-reset after failure window
      setTimeout(() => {
        this.isCircuitOpen = false;
        this.failures = [];
        console.log('✓ Circuit breaker reset');
      }, this.FAILURE_WINDOW);
    }
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBroken(): boolean {
    return this.isCircuitOpen;
  }

  /**
   * Clear cache (for testing/debugging)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('✓ Wikidata ingredients cache cleared');
  }
}

export const wikidataIngredientsService = new WikidataIngredientsService(); 