interface WikidataDishResult {
  dish: {
    value: string;
  };
  dishLabel: {
    value: string;
  };
}

interface WikidataResponse {
  results: {
    bindings: WikidataDishResult[];
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
 * Reliable service for getting dish suggestions from Wikidata
 * Uses simplified queries, caching, and circuit breaker pattern
 */
class WikidataDishesService {
  private readonly WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
  private readonly TIMEOUT = 5000; // Reduced to 5 seconds
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_FAILURES = 3;
  private readonly FAILURE_WINDOW = 60000; // 1 minute
  
  private cache = new Map<string, CacheEntry>();
  private failures: number[] = [];
  private isCircuitOpen = false;

  /**
   * Get dish suggestions from Wikidata based on query
   */
  async getDishSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = normalizeForMatching(query.trim());
    const cacheKey = `dish:${normalizedQuery}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`✓ Using cached dishes for "${query}"`);
      return cached.data;
    }

    // Check circuit breaker
    if (this.isCircuitBroken()) {
      console.log('⚠️ Circuit breaker open, skipping Wikidata dishes call');
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
      
      console.log(`✓ Found ${results.length} dishes from Wikidata for "${query}"`);
      return results;
      
    } catch (error) {
      console.error(`❌ Wikidata dishes error for "${query}":`, error);
      this.recordFailure();
      return [];
    }
  }

  /**
   * Simple, fast search strategy - only search direct instances of dish
   */
  private async searchSimple(query: string): Promise<string[]> {
    // Try exact match first, then partial match
    const strategies = [
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
   * Execute a simple SPARQL query (no complex UNIONs)
   */
  private async executeSimpleQuery(query: string, type: 'exact' | 'partial'): Promise<string[]> {
    // Create accent variations for better matching
    const accentVariations = this.createAccentVariations(query);
    
    let sparqlQuery: string;
    
    if (type === 'exact') {
      // Try exact matches with accent variations
      const exactFilters = accentVariations.map(variant => 
        `LCASE(?dishLabel) = "${variant}"`
      ).join(' || ');
      
      sparqlQuery = `
        SELECT DISTINCT ?dish ?dishLabel WHERE {
          {
            # Direct instances of dish
            ?dish wdt:P31 wd:Q746549 .
          } UNION {
            # Subclasses of dish
            ?dish wdt:P31 ?dishType .
            ?dishType wdt:P279* wd:Q746549 .
          } UNION {
            # Items that are meals and contain food-related properties
            ?dish wdt:P31 wd:Q1362230 .  # meal
            ?dish wdt:P186 ?ingredient .  # made from material
          }
          
          ?dish rdfs:label ?dishLabel .
          FILTER(LANG(?dishLabel) IN ("en", "fr", "es", "it"))
          FILTER(${exactFilters})
        }
        ORDER BY ?dishLabel
        LIMIT 15
      `;
    } else {
      // Partial matches with accent variations
      const partialFilters = accentVariations.map(variant => 
        `CONTAINS(LCASE(?dishLabel), "${variant}")`
      ).join(' || ');
      
      sparqlQuery = `
        SELECT DISTINCT ?dish ?dishLabel WHERE {
          {
            # Direct instances of dish
            ?dish wdt:P31 wd:Q746549 .
          } UNION {
            # Subclasses of dish
            ?dish wdt:P31 ?dishType .
            ?dishType wdt:P279* wd:Q746549 .
          } UNION {
            # Items that are meals and contain food-related properties
            ?dish wdt:P31 wd:Q1362230 .  # meal
            ?dish wdt:P186 ?ingredient .  # made from material
          }
          
          ?dish rdfs:label ?dishLabel .
          FILTER(LANG(?dishLabel) IN ("en", "fr", "es", "it"))
          FILTER(${partialFilters})
        }
        ORDER BY ?dishLabel
        LIMIT 15
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
      
      const dishes = data.results.bindings.map(binding => 
        capitalizeWords(binding.dishLabel.value)
      );
      
      return [...new Set(dishes)].slice(0, 10);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Wikidata dishes request timed out');
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
    console.log('✓ Wikidata dishes cache cleared');
  }
}

export const wikidataDishesService = new WikidataDishesService(); 