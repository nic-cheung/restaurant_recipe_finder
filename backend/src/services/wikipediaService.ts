export interface WikipediaSearchResult {
  title: string;
  description?: string;
  excerpt?: string;
}

export class WikipediaService {
  private readonly baseUrl = 'https://en.wikipedia.org/w/api.php';
  
  /**
   * Search for chefs on Wikipedia
   */
  async searchChefs(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Search for pages containing the query + "chef" using the correct Wikipedia API
      const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query + ' chef')}&srlimit=${limit * 2}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json() as { 
        query?: { 
          search?: Array<{
            title: string;
            snippet: string;
            pageid: number;
          }> 
        } 
      };
      
      if (!data.query?.search || data.query.search.length === 0) {
        return [];
      }

      // Get the first sentence of each article to verify they are actually chefs
      const verifiedChefs: string[] = [];
      
      for (const page of data.query.search) {
        if (verifiedChefs.length >= limit) break;
        
        // Basic filtering first
        if (!this.isLikelyChef(page.title, page.snippet || '')) {
          continue;
        }
        
        const cleanName = this.extractChefName(page.title);
        if (cleanName.length === 0) {
          continue;
        }
        
        // Verify by checking the first sentence of the article
        const isActualChef = await this.verifyIsChef(page.title);
        if (isActualChef) {
          verifiedChefs.push(cleanName);
        }
      }

      return verifiedChefs;
    } catch (error) {
      console.error('Wikipedia chef search failed:', error);
      throw error;
    }
  }

  /**
   * Search for cuisines on Wikipedia
   */
  async searchCuisines(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Try multiple search strategies to find relevant cuisines
      const searchQueries = [
        `${query} cuisine`,
        query // Direct search
      ];
      
      // Add smart suffix matching for shorter queries (3-5 characters)
      // This helps find "Jamaican" when typing "Jam" but avoids false matches for longer queries
      if (query.length >= 3 && query.length <= 5) {
        // Common cuisine name patterns
        const patterns = [
          `${query}aican`, // For "Jam" -> "Jamaican"
          `${query}ican`, // For "Amer" -> "American"
          `${query}ian`, // For "Ital" -> "Italian"
          `${query}ese`, // For "Chin" -> "Chinese"
          `${query}ish`, // For "Turk" -> "Turkish"
          `${query}ean` // For "Kor" -> "Korean"
        ];
        
        for (const pattern of patterns) {
          searchQueries.push(`${pattern} cuisine`);
        }
      }
      
      // For longer queries (4+ characters), also search with progressively shorter versions
      // This helps maintain results when someone types "Jamai" after "Jam" worked
      if (query.length >= 4) {
        // Search with shorter versions of the query
        for (let i = 3; i < query.length; i++) {
          const shortQuery = query.substring(0, i);
          searchQueries.push(`${shortQuery} cuisine`);
          
          // Also try the smart suffix patterns for shorter versions
          if (i <= 5) {
            const patterns = [
              `${shortQuery}aican`,
              `${shortQuery}ican`, 
              `${shortQuery}ian`,
              `${shortQuery}ese`,
              `${shortQuery}ish`,
              `${shortQuery}ean`
            ];
            
            for (const pattern of patterns) {
              searchQueries.push(`${pattern} cuisine`);
            }
          }
        }
      }

      let allResults: Array<{title: string; snippet: string; pageid: number}> = [];
      
      for (const searchQuery of searchQueries) {
        const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=${limit}`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
          }
        });

        if (response.ok) {
          const data = await response.json() as { 
            query?: { 
              search?: Array<{
                title: string;
                snippet: string;
                pageid: number;
              }> 
            } 
          };
          
          if (data.query?.search && data.query.search.length > 0) {
            allResults = allResults.concat(data.query.search);
          }
        }
      }

      if (allResults.length === 0) {
        return [];
      }

      // Remove duplicates by pageid
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.pageid === result.pageid)
      );

      // Filter and clean cuisine names with improved logic
      const cuisineNames = uniqueResults
        .filter(page => this.isLikelyCuisine(page.title, page.snippet || ''))
        .map(page => this.extractCuisineName(page.title))
        .filter(name => name.length > 0 && this.isValidCuisineName(name))
        .filter(name => this.containsQuery(name, query))
        .slice(0, limit);

      return this.sortByRelevance(cuisineNames, query);
    } catch (error) {
      console.error('Wikipedia cuisine search failed:', error);
      throw error;
    }
  }

  /**
   * Search for dishes on Wikipedia
   */
  async searchDishes(query: string, limit: number = 10): Promise<string[]> {
    try {
      // More specific search - focus on actual dish names rather than generic food terms
      const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit * 2}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json() as { 
        query?: { 
          search?: Array<{
            title: string;
            snippet: string;
            pageid: number;
          }> 
        } 
      };
      
      if (!data.query?.search || data.query.search.length === 0) {
        return [];
      }

      // Filter and clean dish names with improved logic
      const dishNames = data.query.search
        .filter(page => this.isLikelyDish(page.title, page.snippet || ''))
        .map(page => this.extractDishName(page.title))
        .filter(name => name.length > 0 && this.isValidDishName(name))
        .filter(name => this.containsQuery(name, query))
        .slice(0, limit);

      return this.sortByRelevance(dishNames, query);
    } catch (error) {
      console.error('Wikipedia dish search failed:', error);
      throw error;
    }
  }

  /**
   * Search for ingredients on Wikipedia
   */
  async searchIngredients(query: string, limit: number = 10): Promise<string[]> {
    try {
      // More targeted search for ingredients
      const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit * 2}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json() as { 
        query?: { 
          search?: Array<{
            title: string;
            snippet: string;
            pageid: number;
          }> 
        } 
      };
      
      if (!data.query?.search || data.query.search.length === 0) {
        return [];
      }

      // Filter and clean ingredient names with improved logic
      const ingredientNames = data.query.search
        .filter(page => this.isLikelyIngredient(page.title, page.snippet || ''))
        .map(page => this.extractIngredientName(page.title))
        .filter(name => name.length > 0 && this.isValidIngredientName(name))
        .filter(name => this.containsQuery(name, query))
        .slice(0, limit);

      return this.sortByRelevance(ingredientNames, query);
    } catch (error) {
      console.error('Wikipedia ingredient search failed:', error);
      throw error;
    }
  }

  /**
   * Check if a Wikipedia page is likely about a chef (basic filtering before verification)
   */
  private isLikelyChef(title: string, description: string): boolean {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Strong negative indicators - immediately exclude these
    const excludeIndicators = [
      'disambiguation', 'category:', 'list of', 'template:', 'user:',
      'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:'
    ];

    // Check if it's likely NOT a chef page
    if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
      return false;
    }

    // Must look like a person's name (First Last or First Middle Last)
    const isPersonName = /^[A-Z][a-z]+(\s[A-Z][a-z]*)*\s[A-Z][a-z]+$/.test(title);
    
    // If it doesn't look like a person's name, it's probably not a chef
    if (!isPersonName) {
      return false;
    }

    // Since we'll verify with the actual article text, we can be more lenient here
    // Just check for any food-related terms
    const foodRelatedIndicators = [
      'chef', 'cook', 'culinary', 'restaurant', 'kitchen', 'cuisine',
      'michelin', 'cookbook', 'recipe', 'food', 'gastronomy', 'baking',
      'pastry', 'sommelier', 'wine', 'dining', 'menu', 'restaurateur'
    ];

    // Check if it has any food-related indicator
    const hasFoodIndicator = foodRelatedIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );

    return hasFoodIndicator;
  }

  /**
   * Check if a Wikipedia page is likely about a cuisine
   */
  private isLikelyCuisine(title: string, description: string): boolean {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Exclude non-cuisine pages
    const excludeIndicators = [
      'disambiguation', 'category:', 'list of', 'template:', 'user:',
      'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
      'restaurant', 'chef', 'cookbook', 'recipe', 'dish', 'ingredient',
      'food trends', 'social media', 'viral', 'history of', 'culture of',
      'outline of', 'food and drink'
    ];

    // Check if it's likely NOT a cuisine page
    if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
      return false;
    }

    // Strong positive indicators for cuisines
    const cuisineIndicators = [
      'cuisine', 'culinary', 'cooking', 'food', 'gastronomy'
    ];

    // Check if it's likely a cuisine page
    const hasCuisineIndicator = cuisineIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );

    // Additional check: if title is about a geographical region's food
    const isGeographicalCuisine = titleLower.includes('cuisine') || 
                                  (titleLower.includes('food') && titleLower.length <= 20);
    
    return hasCuisineIndicator || isGeographicalCuisine;
  }

  /**
   * Check if a Wikipedia page is likely about a dish
   */
  private isLikelyDish(title: string, description: string): boolean {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Exclude generic terms and non-dish pages
    const excludeIndicators = [
      'disambiguation', 'category:', 'list of', 'template:', 'user:',
      'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
      'restaurant', 'chef', 'cookbook', 'cuisine', 'ingredient', 'recipe',
      'cooking', 'food preparation', 'culinary', 'kitchen', 'diet',
      'nutrition', 'health', 'trends', 'tiktok', 'social media', 'viral',
      'national dish', 'traditional food', 'food culture', 'food history',
      'outline of', 'history of', 'culture of', 'food and drink'
    ];

    // Check if it's likely NOT a dish page
    if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
      return false;
    }

    // Positive indicators for actual dishes
    const dishIndicators = [
      'pasta', 'pizza', 'soup', 'salad', 'curry', 'noodles', 'bread',
      'cake', 'pie', 'stew', 'casserole', 'risotto', 'paella', 'sushi',
      'taco', 'burger', 'sandwich', 'omelet', 'frittata', 'quiche'
    ];

    // Check if it's likely a dish page
    const hasDishIndicator = dishIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );

    // Check if it's a short, specific title (likely a dish name)
    const words = title.split(' ');
    const isShortSpecificTitle = words.length <= 4 && words.length >= 2;

    // Check if it contains dish-related keywords in description
    const descriptionHasDishTerms = ['dish', 'food', 'prepared', 'cooked', 'served'].some(term =>
      descLower.includes(term)
    );

    return hasDishIndicator || (isShortSpecificTitle && descriptionHasDishTerms);
  }

  /**
   * Check if a Wikipedia page is likely about an ingredient
   */
  private isLikelyIngredient(title: string, description: string): boolean {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Exclude non-ingredient pages
    const excludeIndicators = [
      'disambiguation', 'category:', 'list of', 'template:', 'user:',
      'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
      'restaurant', 'chef', 'cookbook', 'cuisine', 'dish', 'recipe',
      'cooking', 'preparation', 'history of', 'culture of', 'outline of',
      'food trends', 'social media', 'viral'
    ];

    // Check if it's likely NOT an ingredient page
    if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
      return false;
    }

    // Strong positive indicators for ingredients
    const ingredientIndicators = [
      'spice', 'herb', 'vegetable', 'fruit', 'grain', 'meat', 'fish',
      'dairy', 'oil', 'vinegar', 'seasoning', 'flavoring', 'condiment',
      'powder', 'extract', 'sauce', 'paste', 'ingredient', 'edible'
    ];

    // Check if it's likely an ingredient page
    const hasIngredientIndicator = ingredientIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );

    // Additional check: simple, single-word or compound ingredient names
    const words = title.split(' ');
    const isSimpleIngredient = words.length <= 2 && /^[A-Za-z\s-]+$/.test(title);
    
    return hasIngredientIndicator || isSimpleIngredient;
  }

  /**
   * Extract clean chef name from Wikipedia title
   */
  private extractChefName(title: string): string {
    // Remove common Wikipedia suffixes and prefixes
    let cleanName = title
      .replace(/\s*\(chef\)/gi, '')
      .replace(/\s*\(cook\)/gi, '')
      .replace(/\s*\(restaurateur\)/gi, '')
      .replace(/\s*\(American chef\)/gi, '')
      .replace(/\s*\(British chef\)/gi, '')
      .replace(/\s*\(French chef\)/gi, '')
      .replace(/\s*\(.*?\)/g, '') // Remove any parenthetical info
      .trim();

    // Must look like a proper person's name (First Last or First Middle Last)
    const namePattern = /^[A-Z][a-z]+(\s[A-Z][a-z]*)*\s[A-Z][a-z]+$/;
    
    // Additional validation - exclude obvious non-person names
    const invalidNames = [
      'roman empire', 'ancient rome', 'middle ages', 'renaissance',
      'modern era', 'contemporary', 'traditional', 'classic', 'fusion',
      'fine dining', 'fast food', 'street food', 'home cooking'
    ];
    
    const cleanNameLower = cleanName.toLowerCase();
    
    // Check if it's an invalid name
    if (invalidNames.some(invalid => cleanNameLower.includes(invalid))) {
      return '';
    }

    // Only return if it looks like a person's name and is reasonable length
    if (namePattern.test(cleanName) && cleanName.length >= 5 && cleanName.length <= 50) {
      return cleanName;
    }

    return '';
  }

  /**
   * Extract clean cuisine name from Wikipedia title
   */
  private extractCuisineName(title: string): string {
    // Remove common Wikipedia suffixes and prefixes
    let cleanName = title
      .replace(/\s*cuisine$/gi, '')
      .replace(/\s*culinary$/gi, '')
      .replace(/\s*cooking$/gi, '')
      .replace(/\s*food$/gi, '')
      .replace(/\s*\(.*?\)/g, '') // Remove any parenthetical info
      .trim();

    // Only return if it looks like a cuisine name
    if (cleanName.length >= 3 && /^[A-Z][a-zA-Z\s\-]+$/.test(cleanName)) {
      return cleanName;
    }

    return '';
  }

  /**
   * Extract clean dish name from Wikipedia title
   */
  private extractDishName(title: string): string {
    // Remove common Wikipedia suffixes and prefixes
    let cleanName = title
      .replace(/\s*\(dish\)/gi, '')
      .replace(/\s*\(food\)/gi, '')
      .replace(/\s*\(recipe\)/gi, '')
      .replace(/\s*\(.*?\)/g, '') // Remove any parenthetical info
      .trim();

    // Only return if it looks like a dish name
    if (cleanName.length >= 2 && /^[A-Za-z][a-zA-Z\s\-']+$/.test(cleanName)) {
      return cleanName;
    }

    return '';
  }

  /**
   * Extract clean ingredient name from Wikipedia title
   */
  private extractIngredientName(title: string): string {
    // Remove common Wikipedia suffixes and prefixes
    let cleanName = title
      .replace(/\s*\(ingredient\)/gi, '')
      .replace(/\s*\(spice\)/gi, '')
      .replace(/\s*\(herb\)/gi, '')
      .replace(/\s*\(food\)/gi, '')
      .replace(/\s*\(.*?\)/g, '') // Remove any parenthetical info
      .trim();

    // Only return if it looks like an ingredient name
    if (cleanName.length >= 2 && /^[A-Za-z][a-zA-Z\s\-']+$/.test(cleanName)) {
      return cleanName;
    }

    return '';
  }

  /**
   * Verify if a Wikipedia page is actually about a chef by checking the first sentence
   */
  private async verifyIsChef(pageTitle: string): Promise<boolean> {
    try {
      // First, exclude obvious TV shows and fictional characters from the title
      const titleLower = pageTitle.toLowerCase();
      const excludeTitles = [
        'iron chef', 'swedish chef', 'iron chef america', 'iron chef japan',
        'masterchef', 'top chef', 'hell\'s kitchen', 'chef\'s table',
        'great british bake off', 'great british baking show', 'chopped',
        'the chef show', 'chef\'s line', 'the final table', 'cooking show',
        'food network', 'television', 'tv show', 'reality show', 'competition'
      ];
      
      if (excludeTitles.some(exclude => titleLower.includes(exclude))) {
        return false;
      }

      // Use Wikipedia API to get the first sentence/extract of the article
      const extractUrl = `${this.baseUrl}?action=query&format=json&prop=extracts&exintro=true&exsentences=1&explaintext=true&titles=${encodeURIComponent(pageTitle)}`;
      
      const response = await fetch(extractUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json() as {
        query?: {
          pages?: {
            [key: string]: {
              extract?: string;
            }
          }
        }
      };

      const pages = data.query?.pages;
      if (!pages) return false;

      // Get the first (and only) page from the response
      const pageData = Object.values(pages)[0];
      const extract = pageData?.extract?.toLowerCase();

      if (!extract) return false;

      // Check for very specific patterns that indicate someone IS a chef
      // Use more precise regex patterns that require the exact sequence
      const chefPatterns = [
        /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*chef/i,
        /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*cook/i,
        /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning)?\s*restaurateur/i,
        /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*chef/i,
        /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*cook/i,
        /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning)?\s*restaurateur/i
      ];

      // Also exclude if the extract mentions it's a TV show or fictional character
      const excludeFromExtract = [
        'television', 'tv show', 'reality show', 'cooking show', 'competition',
        'fictional', 'character', 'puppet', 'muppet', 'cartoon', 'animated',
        'series', 'program', 'show', 'broadcast', 'network'
      ];

      if (excludeFromExtract.some(exclude => extract.includes(exclude))) {
        return false;
      }

      return chefPatterns.some(pattern => pattern.test(extract));
    } catch (error) {
      console.error('Wikipedia verification failed:', error);
      return false;
    }
  }

  /**
   * Get chef details from Wikipedia (for future enhancement)
   */
  async getChefDetails(chefName: string): Promise<WikipediaSearchResult | null> {
    try {
      // Use the Wikipedia REST API for page extracts
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(chefName)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as WikipediaSearchResult;
      return data;
    } catch (error) {
      console.error('Wikipedia chef details failed:', error);
      return null;
    }
  }

  /**
   * Validate if a dish name is appropriate for suggestions
   */
  private isValidDishName(name: string): boolean {
    const nameLower = name.toLowerCase();
    
    // Exclude generic terms
    const genericTerms = [
      'recipe', 'dish', 'food', 'meal', 'cooking', 'preparation',
      'national dish', 'traditional food', 'cuisine', 'culinary',
      'restaurant', 'chef', 'cookbook', 'kitchen', 'diet', 'nutrition',
      'trends', 'viral', 'social media', 'tiktok', 'history', 'culture',
      'outline', 'list', 'category'
    ];

    if (genericTerms.some(term => nameLower === term || nameLower.includes(term))) {
      return false;
    }

    // Exclude people's names (common first/last name patterns)
    const peoplePatterns = [
      /^[A-Z][a-z]+ [A-Z][a-z]+$/, // "Stephen Curry", "Tim Curry"
      /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i, // Titles
      /\b(chef|cook|author|writer|actor|singer|player|athlete)\b/i // Professions
    ];

    if (peoplePatterns.some(pattern => pattern.test(name))) {
      return false;
    }

    // Exclude non-food items
    const nonFoodTerms = [
      'tree', 'plant', 'animal', 'person', 'people', 'company', 'brand',
      'store', 'shop', 'restaurant', 'hotel', 'nuclear', 'physics',
      'chemistry', 'science', 'technology', 'politics', 'sports', 'game'
    ];

    if (nonFoodTerms.some(term => nameLower.includes(term))) {
      return false;
    }

    // Must be between 3-50 characters (increased minimum)
    if (name.length < 3 || name.length > 50) {
      return false;
    }

    // Must not be just a single common word
    const singleGenericWords = [
      'pasta', 'rice', 'bread', 'soup', 'salad', 'meat', 'fish',
      'chicken', 'beef', 'pork', 'vegetable', 'fruit', 'dessert', 'curry'
    ];

    if (singleGenericWords.includes(nameLower)) {
      return false;
    }

    // Should contain food-related words or be a compound dish name
    const foodIndicators = [
      'pasta', 'pizza', 'soup', 'salad', 'curry', 'noodles', 'bread',
      'cake', 'pie', 'stew', 'casserole', 'risotto', 'paella', 'sushi',
      'taco', 'burger', 'sandwich', 'omelet', 'frittata', 'quiche',
      'sauce', 'alla', 'con', 'de', 'du', 'with', 'and'
    ];

    const hasValidFoodIndicator = foodIndicators.some(indicator => 
      nameLower.includes(indicator)
    );

    // Or has multiple words (likely a specific dish)
    const isMultiWordDish = name.split(' ').length >= 2;

    return hasValidFoodIndicator || isMultiWordDish;
  }

  /**
   * Validate if a cuisine name is appropriate for suggestions
   */
  private isValidCuisineName(name: string): boolean {
    const nameLower = name.toLowerCase();
    
    // Exclude generic terms
    const genericTerms = [
      'cuisine', 'food', 'cooking', 'culinary', 'gastronomy',
      'restaurant', 'chef', 'cookbook', 'recipe', 'dish',
      'history', 'culture', 'outline', 'list', 'category'
    ];

    if (genericTerms.some(term => nameLower === term)) {
      return false;
    }

    // Exclude people's names and non-geographical terms
    const peoplePatterns = [
      /^[A-Z][a-z]+ [A-Z][a-z]+$/, // "John Smith"
      /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i // Titles
    ];

    if (peoplePatterns.some(pattern => pattern.test(name))) {
      return false;
    }

    // Must be between 3-30 characters (increased minimum)
    if (name.length < 3 || name.length > 30) {
      return false;
    }

    // Should be geographical or style-based
    const validCuisineIndicators = [
      'asian', 'european', 'american', 'african', 'middle eastern',
      'mediterranean', 'fusion', 'traditional', 'modern', 'contemporary',
      'regional', 'ethnic', 'italian', 'french', 'chinese', 'japanese',
      'indian', 'thai', 'mexican', 'korean', 'vietnamese', 'turkish',
      'jamaican', 'caribbean', 'greek', 'spanish', 'german', 'british',
      'moroccan', 'lebanese', 'peruvian', 'brazilian', 'argentinian',
      'russian', 'polish', 'ethiopian', 'nigerian', 'filipino', 'indonesian'
    ];

    const hasValidIndicator = validCuisineIndicators.some(indicator => 
      nameLower.includes(indicator) || indicator.includes(nameLower)
    );

    // Or follows geographical pattern (ends with common geographical suffixes)
    const geographicalPattern = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;
    const isGeographical = geographicalPattern.test(name) && name.split(' ').length <= 3;

    return hasValidIndicator || isGeographical;
  }

  /**
   * Validate if an ingredient name is appropriate for suggestions
   */
  private isValidIngredientName(name: string): boolean {
    const nameLower = name.toLowerCase();
    
    // Exclude generic terms
    const genericTerms = [
      'ingredient', 'spice', 'herb', 'seasoning', 'flavoring',
      'food', 'cooking', 'culinary', 'preparation', 'kitchen',
      'recipe', 'dish', 'cuisine', 'restaurant', 'chef',
      'history', 'culture', 'outline', 'list', 'category'
    ];

    if (genericTerms.some(term => nameLower === term)) {
      return false;
    }

    // Exclude people's names
    const peoplePatterns = [
      /^[A-Z][a-z]+ [A-Z][a-z]+$/, // "Herb Alpert"
      /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i, // Titles
      /\b(chef|cook|author|writer|actor|singer|player|athlete)\b/i // Professions
    ];

    if (peoplePatterns.some(pattern => pattern.test(name))) {
      return false;
    }

    // Exclude non-food/non-ingredient items
    const nonIngredientTerms = [
      'farm', 'garden', 'company', 'brand', 'store', 'shop',
      'person', 'people', 'band', 'group', 'team', 'show'
    ];

    if (nonIngredientTerms.some(term => nameLower.includes(term))) {
      return false;
    }

    // Must be between 3-25 characters (increased minimum)
    if (name.length < 3 || name.length > 25) {
      return false;
    }

    // Should be actual ingredient names or compounds
    const validIngredientIndicators = [
      'oil', 'vinegar', 'sauce', 'powder', 'extract', 'seed', 'leaf',
      'root', 'berry', 'pepper', 'salt', 'sugar', 'flour', 'milk',
      'cheese', 'butter', 'cream', 'spice', 'herb', 'basil', 'oregano',
      'thyme', 'rosemary', 'garlic', 'onion', 'ginger', 'turmeric',
      'cumin', 'paprika', 'cinnamon', 'vanilla', 'chocolate'
    ];

    const hasValidIndicator = validIngredientIndicators.some(indicator => 
      nameLower.includes(indicator) || indicator.includes(nameLower)
    );

    // Or is a simple ingredient name (single word, lowercase)
    const isSimpleIngredient = /^[a-z]+$/.test(nameLower) && name.split(' ').length === 1;

    return hasValidIndicator || isSimpleIngredient;
  }

  /**
   * Check if a name contains the user's query (case-insensitive)
   * Enhanced to support prefix matching and fuzzy matching for partial queries
   */
  private containsQuery(name: string, query: string): boolean {
    if (!query.trim()) return true;
    
    const nameLower = name.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Direct substring match (most important for progressive typing)
    if (nameLower.includes(queryLower)) {
      return true;
    }
    
    // Prefix match - if query is a prefix of the name
    if (nameLower.startsWith(queryLower)) {
      return true;
    }
    
    // Progressive typing support - if the name starts with a shorter version of the query
    // This helps when someone types "Jamai" and we want to match "Jamaican"
    if (queryLower.length >= 4) {
      for (let i = 3; i < queryLower.length; i++) {
        const shortQuery = queryLower.substring(0, i);
        if (nameLower.startsWith(shortQuery)) {
          return true;
        }
      }
    }
    
    // Fuzzy prefix match - if the name starts with the query + common suffixes
    const commonSuffixes = ['an', 'ian', 'ese', 'ish', 'ean'];
    for (const suffix of commonSuffixes) {
      if (nameLower.startsWith(queryLower + suffix)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Sort suggestions by relevance to the query
   */
  private sortByRelevance(suggestions: string[], query: string): string[] {
    if (!query.trim()) return suggestions;

    const queryLower = query.toLowerCase();

    return suggestions.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      // Exact matches first
      const aExact = aLower === queryLower;
      const bExact = bLower === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with query
      const aStarts = aLower.startsWith(queryLower);
      const bStarts = bLower.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Contains query (closer to beginning wins)
      const aIndex = aLower.indexOf(queryLower);
      const bIndex = bLower.indexOf(queryLower);
      if (aIndex !== bIndex) return aIndex - bIndex;

      // Shorter names win (more specific)
      if (a.length !== b.length) return a.length - b.length;

      // Alphabetical as final tiebreaker
      return a.localeCompare(b);
    });
  }
}

// Export singleton instance
export const wikipediaService = new WikipediaService(); 