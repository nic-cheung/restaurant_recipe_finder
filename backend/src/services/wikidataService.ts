interface WikidataChef {
  chef: string;
  chefLabel: string;
  description?: string | undefined;
  nationality?: string | undefined;
  birthDate?: string | undefined;
}

interface WikidataResponse {
  results: {
    bindings: Array<{
      chef: { value: string };
      chefLabel: { value: string };
      description?: { value: string };
      nationality?: { value: string };
      birthDate?: { value: string };
    }>;
  };
}

export class WikidataService {
  private readonly sparqlEndpoint = 'https://query.wikidata.org/sparql';
  private readonly TIMEOUT = 5000; // 5 second timeout
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_FAILURES = 3;
  private readonly FAILURE_WINDOW = 60000; // 1 minute
  
  private cache = new Map<string, { data: string[]; timestamp: number }>();
  private failures: number[] = [];
  private isCircuitOpen = false;

  /**
   * Search for chefs using Wikidata SPARQL queries
   * This is much more accurate than Wikipedia search as it uses structured data
   */
  async searchChefs(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `chef:${normalizedQuery}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`✓ Using cached chefs for "${query}"`);
      return cached.data;
    }

    // Check circuit breaker
    if (this.isCircuitBroken()) {
      console.log('⚠️ Circuit breaker open, skipping Wikidata chefs call');
      return [];
    }

    try {
      // First try a simple CONTAINS search which is more reliable
      let chefs = await this.searchChefsSimple(query, limit);
      
      // If we got results, cache and return them
      if (chefs.length > 0) {
        this.cache.set(cacheKey, {
          data: chefs,
          timestamp: Date.now()
        });
        
        // Reset failures on success
        this.failures = [];
        this.isCircuitOpen = false;
        
        console.log(`✓ Found ${chefs.length} chefs from Wikidata for "${query}"`);
        return chefs;
      }
      
      // If simple search failed, try the more complex regex search
      const normalizedQueryForRegex = this.normalizeForSearch(query.toLowerCase());
      chefs = await this.searchChefsWithRegex(normalizedQueryForRegex, limit);
      
      // Cache results (even if empty)
      this.cache.set(cacheKey, {
        data: chefs,
        timestamp: Date.now()
      });
      
      // Reset failures on success
      this.failures = [];
      this.isCircuitOpen = false;
      
      console.log(`✓ Found ${chefs.length} chefs from Wikidata for "${query}"`);
      return chefs;
      
    } catch (error) {
      console.error(`❌ Wikidata chefs error for "${query}":`, error);
      this.recordFailure();
      return [];
    }
  }

  /**
   * Simple search fallback using CONTAINS instead of regex
   */
  private async searchChefsSimple(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Try multiple search variations for better results
      const searchVariations = [
        query.toLowerCase(),
        query.toLowerCase().trim(),
        // Try with common accent variations for French names
        query.toLowerCase().replace(/e/g, 'é').replace(/a/g, 'à'),
        query.toLowerCase().replace(/e/g, 'è'),
        // Also try the reverse - remove accents
        query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        // Try partial matches for longer names
        query.toLowerCase().split(' ')[0], // First name only
        query.toLowerCase().split(' ').pop() || query.toLowerCase() // Last name only
      ];

      for (const searchQuery of searchVariations) {
        const sparqlQuery = `
          SELECT DISTINCT ?chef ?chefLabel WHERE {
            ?chef wdt:P106 wd:Q3499072 .  # occupation: chef
            ?chef rdfs:label ?chefLabel .
            
            # Try multiple languages for better coverage
            FILTER(LANG(?chefLabel) = "en" || LANG(?chefLabel) = "fr" || LANG(?chefLabel) = "es" || LANG(?chefLabel) = "it")
            FILTER(CONTAINS(LCASE(?chefLabel), "${searchQuery}"))
            
            # Exclude fictional characters and non-human entities
            FILTER NOT EXISTS { ?chef wdt:P31 wd:Q95074 }  # fictional character
            FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15632617 } # fictional human
            FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15773317 } # television character
          }
          ORDER BY ?chefLabel
          LIMIT ${limit}
        `;

        const response = await fetch(this.sparqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
          },
          body: `query=${encodeURIComponent(sparqlQuery)}`,
          signal: AbortSignal.timeout(this.TIMEOUT)
        });

        if (response.ok) {
          const data = await response.json() as WikidataResponse;
          
          if (data.results?.bindings && data.results.bindings.length > 0) {
            const results = data.results.bindings
              .map(binding => this.extractChefName(binding.chefLabel.value))
              .filter(name => name && name.length > 0)
              .filter((name, index, array) => array.indexOf(name) === index);
            
            if (results.length > 0) {
              return results;
            }
          }
        }
      }

      return [];
    } catch (error) {
      console.error('Wikidata simple chef search failed:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a chef from Wikidata
   */
  async getChefDetails(chefName: string): Promise<WikidataChef | null> {
    try {
      const sparqlQuery = `
        SELECT ?chef ?chefLabel ?description ?nationality ?birthDate WHERE {
          ?chef wdt:P106 wd:Q3499072 .  # occupation: chef
          ?chef rdfs:label ?chefLabel .
          FILTER(LANG(?chefLabel) = "en")
          FILTER(LCASE(?chefLabel) = "${chefName.toLowerCase()}")
          
          OPTIONAL { ?chef schema:description ?description . FILTER(LANG(?description) = "en") }
          OPTIONAL { ?chef wdt:P27 ?country . ?country rdfs:label ?nationality . FILTER(LANG(?nationality) = "en") }
          OPTIONAL { ?chef wdt:P569 ?birthDate }
        }
        LIMIT 1
      `;

      const response = await fetch(this.sparqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as WikidataResponse;
      
      if (!data.results?.bindings || data.results.bindings.length === 0) {
        return null;
      }

      const binding = data.results.bindings[0];
      if (!binding) {
        return null;
      }
      
      return {
        chef: binding.chef.value,
        chefLabel: binding.chefLabel.value,
        description: binding.description?.value || undefined,
        nationality: binding.nationality?.value || undefined,
        birthDate: binding.birthDate?.value || undefined
      };
    } catch (error) {
      console.error('Wikidata chef details failed:', error);
      return null;
    }
  }

  /**
   * Search for chefs by cuisine type
   */
  async searchChefsByCuisine(cuisine: string, limit: number = 10): Promise<string[]> {
    try {
      const sparqlQuery = `
        SELECT DISTINCT ?chef ?chefLabel WHERE {
          ?chef wdt:P106 wd:Q3499072 .  # occupation: chef
          ?chef rdfs:label ?chefLabel .
          FILTER(LANG(?chefLabel) = "en")
          
          # Try to find chefs associated with specific cuisines
          {
            ?chef wdt:P136 ?cuisine_type .  # genre/style
            ?cuisine_type rdfs:label ?cuisine_label .
            FILTER(LANG(?cuisine_label) = "en")
            FILTER(CONTAINS(LCASE(?cuisine_label), "${cuisine.toLowerCase()}"))
          } UNION {
            ?chef wdt:P27 ?country .  # nationality
            ?country rdfs:label ?country_label .
            FILTER(LANG(?country_label) = "en")
            FILTER(CONTAINS(LCASE(?country_label), "${cuisine.toLowerCase()}"))
          }
          
          # Exclude fictional characters
          FILTER NOT EXISTS { ?chef wdt:P31 wd:Q95074 }
          FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15632617 }
          FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15773317 }
        }
        ORDER BY ?chefLabel
        LIMIT ${limit}
      `;

      const response = await fetch(this.sparqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as WikidataResponse;
      
      if (!data.results?.bindings || data.results.bindings.length === 0) {
        return [];
      }

      return data.results.bindings
        .map(binding => this.extractChefName(binding.chefLabel.value))
        .filter(name => name && name.length > 0)
        .filter((name, index, array) => array.indexOf(name) === index);
    } catch (error) {
      console.error('Wikidata cuisine chef search failed:', error);
      return [];
    }
  }

  /**
   * Extract and clean chef name from Wikidata label
   */
  private extractChefName(label: string): string {
    // Wikidata labels are usually clean, but let's do basic cleanup
    let cleanName = label.trim();
    
    // Remove any disambiguation info in parentheses if it's not part of the name
    if (cleanName.includes('(') && (
      cleanName.includes('chef') || 
      cleanName.includes('cook') || 
      cleanName.includes('restaurateur') ||
      cleanName.includes('born') ||
      cleanName.includes('died')
    )) {
      cleanName = cleanName.replace(/\s*\([^)]*\)$/, '').trim();
    }
    
    // Validate it looks like a person's name
    if (this.isValidPersonName(cleanName)) {
      return cleanName;
    }
    
    return '';
  }

  /**
   * Normalize search query to handle accented characters and improve matching
   */
  private normalizeForSearch(query: string): string {
    // For SPARQL regex, we need to escape square brackets properly
    // Instead of using character classes, let's use alternation which is more reliable
    return query
      .replace(/[aáàâäãå]/gi, '(a|á|à|â|ä|ã|å)')
      .replace(/[eéèêë]/gi, '(e|é|è|ê|ë)')
      .replace(/[iíìîï]/gi, '(i|í|ì|î|ï)')
      .replace(/[oóòôöõ]/gi, '(o|ó|ò|ô|ö|õ)')
      .replace(/[uúùûü]/gi, '(u|ú|ù|û|ü)')
      .replace(/[cç]/gi, '(c|ç)')
      .replace(/[nñ]/gi, '(n|ñ)')
      // Escape special regex characters that might interfere with SPARQL
      .replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
  }

  /**
   * Check if a string looks like a valid person's name
   */
  private isValidPersonName(name: string): boolean {
    // Basic validation for person names
    if (!name || name.length < 2 || name.length > 100) {
      return false;
    }
    
    // Should start with a capital letter
    if (!/^[A-Z]/.test(name)) {
      return false;
    }
    
    // Should only contain letters, spaces, hyphens, apostrophes, and dots
    if (!/^[A-Za-z\s\-'.]+$/.test(name)) {
      return false;
    }
    
    // Should not be all caps (likely an acronym)
    if (name === name.toUpperCase() && name.length > 3) {
      return false;
    }
    
    // Should not contain obvious non-name words
    const nonNameWords = [
      'show', 'series', 'program', 'channel', 'network', 'tv', 'television',
      'movie', 'film', 'book', 'magazine', 'restaurant', 'kitchen', 'company',
      'inc', 'ltd', 'corp', 'group', 'brand', 'empire', 'kingdom', 'nation'
    ];
    
    const lowerName = name.toLowerCase();
    if (nonNameWords.some(word => lowerName.includes(word))) {
      return false;
    }
    
    return true;
  }

  /**
   * Search chefs with regex patterns (more complex but comprehensive)
   */
  private async searchChefsWithRegex(normalizedQuery: string, limit: number = 10): Promise<string[]> {
    const sparqlQuery = `
      SELECT DISTINCT ?chef ?chefLabel ?description ?nationality ?birthDate WHERE {
        ?chef wdt:P106 wd:Q3499072 .  # occupation: chef
        ?chef rdfs:label ?chefLabel .
        
        # Search across multiple languages for better coverage
        FILTER(LANG(?chefLabel) = "en" || LANG(?chefLabel) = "fr" || LANG(?chefLabel) = "es" || LANG(?chefLabel) = "it")
        
        # Use regex for better matching with accented characters
        FILTER(REGEX(LCASE(?chefLabel), "${normalizedQuery}", "i"))
        
        # Optional additional info
        OPTIONAL { ?chef schema:description ?description . FILTER(LANG(?description) = "en") }
        OPTIONAL { ?chef wdt:P27 ?country . ?country rdfs:label ?nationality . FILTER(LANG(?nationality) = "en") }
        OPTIONAL { ?chef wdt:P569 ?birthDate }
        
        # Exclude fictional characters and non-human entities
        FILTER NOT EXISTS { ?chef wdt:P31 wd:Q95074 }  # fictional character
        FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15632617 } # fictional human
        FILTER NOT EXISTS { ?chef wdt:P31 wd:Q15773317 } # television character
      }
      ORDER BY ?chefLabel
      LIMIT ${limit}
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(this.sparqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as WikidataResponse;
      
      if (!data.results?.bindings || data.results.bindings.length === 0) {
        return [];
      }

      // Extract chef names and clean them
      const chefs = data.results.bindings
        .map(binding => this.extractChefName(binding.chefLabel.value))
        .filter(name => name && name.length > 0)
        .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates

      return chefs;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Wikidata chefs request timed out');
      }
      
      throw error;
    }
  }

  private isCircuitBroken(): boolean {
    // If circuit is already open, check if enough time has passed to reset it
    if (this.isCircuitOpen) {
      const now = Date.now();
      const oldestFailure = this.failures[0];
      if (oldestFailure && now - oldestFailure > this.FAILURE_WINDOW) {
        // Reset the circuit
        this.isCircuitOpen = false;
        this.failures = [];
        console.log('✓ Circuit breaker reset for chefs service');
        return false;
      }
      return true;
    }

    const now = Date.now();
    
    // Filter out failures that are older than the failure window
    this.failures = this.failures.filter(failure => now - failure < this.FAILURE_WINDOW);

    // Check if we've reached the max number of failures
    if (this.failures.length >= this.MAX_FAILURES) {
      this.isCircuitOpen = true;
      console.log('⚠️ Circuit breaker opened for chefs service');
      return true;
    }

    return false;
  }

  private recordFailure() {
    this.failures.push(Date.now());
    
    // Check if we should open the circuit
    if (this.failures.length >= this.MAX_FAILURES) {
      this.isCircuitOpen = true;
      console.log('⚠️ Circuit breaker opened due to repeated failures');
    }
  }
}

export const wikidataService = new WikidataService(); 