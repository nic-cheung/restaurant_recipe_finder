"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikidataService = exports.WikidataService = void 0;
class WikidataService {
    constructor() {
        this.sparqlEndpoint = 'https://query.wikidata.org/sparql';
        this.TIMEOUT = 5000;
        this.CACHE_TTL = 300000;
        this.MAX_FAILURES = 3;
        this.FAILURE_WINDOW = 60000;
        this.cache = new Map();
        this.failures = [];
        this.isCircuitOpen = false;
    }
    async searchChefs(query, limit = 10) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const normalizedQuery = query.toLowerCase().trim();
        const cacheKey = `chef:${normalizedQuery}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log(`✓ Using cached chefs for "${query}"`);
            return cached.data;
        }
        if (this.isCircuitBroken()) {
            console.log('⚠️ Circuit breaker open, skipping Wikidata chefs call');
            return [];
        }
        try {
            let chefs = await this.searchChefsSimple(query, limit);
            if (chefs.length > 0) {
                this.cache.set(cacheKey, {
                    data: chefs,
                    timestamp: Date.now()
                });
                this.failures = [];
                this.isCircuitOpen = false;
                console.log(`✓ Found ${chefs.length} chefs from Wikidata for "${query}"`);
                return chefs;
            }
            const normalizedQueryForRegex = this.normalizeForSearch(query.toLowerCase());
            chefs = await this.searchChefsWithRegex(normalizedQueryForRegex, limit);
            this.cache.set(cacheKey, {
                data: chefs,
                timestamp: Date.now()
            });
            this.failures = [];
            this.isCircuitOpen = false;
            console.log(`✓ Found ${chefs.length} chefs from Wikidata for "${query}"`);
            return chefs;
        }
        catch (error) {
            console.error(`❌ Wikidata chefs error for "${query}":`, error);
            this.recordFailure();
            return [];
        }
    }
    async searchChefsSimple(query, limit = 10) {
        try {
            const searchVariations = [
                query.toLowerCase(),
                query.toLowerCase().trim(),
                query.toLowerCase().replace(/e/g, 'é').replace(/a/g, 'à'),
                query.toLowerCase().replace(/e/g, 'è'),
                query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
                query.toLowerCase().split(' ')[0],
                query.toLowerCase().split(' ').pop() || query.toLowerCase()
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
                    const data = await response.json();
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
        }
        catch (error) {
            console.error('Wikidata simple chef search failed:', error);
            return [];
        }
    }
    async getChefDetails(chefName) {
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
            const data = await response.json();
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
        }
        catch (error) {
            console.error('Wikidata chef details failed:', error);
            return null;
        }
    }
    async searchChefsByCuisine(cuisine, limit = 10) {
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
            const data = await response.json();
            if (!data.results?.bindings || data.results.bindings.length === 0) {
                return [];
            }
            return data.results.bindings
                .map(binding => this.extractChefName(binding.chefLabel.value))
                .filter(name => name && name.length > 0)
                .filter((name, index, array) => array.indexOf(name) === index);
        }
        catch (error) {
            console.error('Wikidata cuisine chef search failed:', error);
            return [];
        }
    }
    extractChefName(label) {
        let cleanName = label.trim();
        if (cleanName.includes('(') && (cleanName.includes('chef') ||
            cleanName.includes('cook') ||
            cleanName.includes('restaurateur') ||
            cleanName.includes('born') ||
            cleanName.includes('died'))) {
            cleanName = cleanName.replace(/\s*\([^)]*\)$/, '').trim();
        }
        if (this.isValidPersonName(cleanName)) {
            return cleanName;
        }
        return '';
    }
    normalizeForSearch(query) {
        return query
            .replace(/[aáàâäãå]/gi, '(a|á|à|â|ä|ã|å)')
            .replace(/[eéèêë]/gi, '(e|é|è|ê|ë)')
            .replace(/[iíìîï]/gi, '(i|í|ì|î|ï)')
            .replace(/[oóòôöõ]/gi, '(o|ó|ò|ô|ö|õ)')
            .replace(/[uúùûü]/gi, '(u|ú|ù|û|ü)')
            .replace(/[cç]/gi, '(c|ç)')
            .replace(/[nñ]/gi, '(n|ñ)')
            .replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
    }
    isValidPersonName(name) {
        if (!name || name.length < 2 || name.length > 100) {
            return false;
        }
        if (!/^[A-Z]/.test(name)) {
            return false;
        }
        if (!/^[A-Za-z\s\-'.]+$/.test(name)) {
            return false;
        }
        if (name === name.toUpperCase() && name.length > 3) {
            return false;
        }
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
    async searchChefsWithRegex(normalizedQuery, limit = 10) {
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
            const data = await response.json();
            if (!data.results?.bindings || data.results.bindings.length === 0) {
                return [];
            }
            const chefs = data.results.bindings
                .map(binding => this.extractChefName(binding.chefLabel.value))
                .filter(name => name && name.length > 0)
                .filter((name, index, array) => array.indexOf(name) === index);
            return chefs;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Wikidata chefs request timed out');
            }
            throw error;
        }
    }
    isCircuitBroken() {
        if (this.isCircuitOpen) {
            const now = Date.now();
            const oldestFailure = this.failures[0];
            if (oldestFailure && now - oldestFailure > this.FAILURE_WINDOW) {
                this.isCircuitOpen = false;
                this.failures = [];
                console.log('✓ Circuit breaker reset for chefs service');
                return false;
            }
            return true;
        }
        const now = Date.now();
        this.failures = this.failures.filter(failure => now - failure < this.FAILURE_WINDOW);
        if (this.failures.length >= this.MAX_FAILURES) {
            this.isCircuitOpen = true;
            console.log('⚠️ Circuit breaker opened for chefs service');
            return true;
        }
        return false;
    }
    recordFailure() {
        this.failures.push(Date.now());
        if (this.failures.length >= this.MAX_FAILURES) {
            this.isCircuitOpen = true;
            console.log('⚠️ Circuit breaker opened due to repeated failures');
        }
    }
}
exports.WikidataService = WikidataService;
exports.wikidataService = new WikidataService();
//# sourceMappingURL=wikidataService.js.map