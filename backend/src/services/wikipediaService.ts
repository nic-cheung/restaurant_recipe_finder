export interface WikipediaSearchResult {
  title: string;
  description?: string;
  excerpt?: string;
}

export class WikipediaService {
  private readonly baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  
  /**
   * Search for chefs on Wikipedia
   */
  async searchChefs(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Search for pages containing the query + "chef"
      const searchUrl = `${this.baseUrl}/page/search?q=${encodeURIComponent(query + ' chef')}&limit=${limit}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json() as { pages?: WikipediaSearchResult[] };
      
      if (!data.pages || data.pages.length === 0) {
        return [];
      }

      // Filter and clean chef names
      const chefNames = data.pages
        .filter(page => this.isLikelyChef(page.title, page.description || page.excerpt || ''))
        .map(page => this.extractChefName(page.title))
        .filter(name => name.length > 0)
        .slice(0, limit);

      return chefNames;
    } catch (error) {
      console.error('Wikipedia chef search failed:', error);
      throw error;
    }
  }

  /**
   * Check if a Wikipedia page is likely about a chef
   */
  private isLikelyChef(title: string, description: string): boolean {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Positive indicators
    const chefIndicators = [
      'chef', 'cook', 'culinary', 'restaurant', 'kitchen', 'cuisine',
      'michelin', 'cookbook', 'recipe', 'food', 'gastronomy', 'culinary arts'
    ];
    
    // Negative indicators to filter out non-chef results
    const excludeIndicators = [
      'disambiguation', 'category:', 'list of', 'template:', 'user:',
      'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:'
    ];

    // Check if it's likely NOT a chef page
    if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
      return false;
    }

    // Check if it's likely a chef page
    const hasChefIndicator = chefIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );

    // Additional check: if query is already a chef name, be more lenient
    const isPersonName = /^[A-Z][a-z]+ [A-Z][a-z]+/.test(title);
    
    return hasChefIndicator || isPersonName;
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

    // Only return if it looks like a person's name
    if (/^[A-Z][a-zA-Z'\-\s]+$/.test(cleanName) && cleanName.length >= 3) {
      return cleanName;
    }

    return '';
  }

  /**
   * Get chef details from Wikipedia (for future enhancement)
   */
  async getChefDetails(chefName: string): Promise<WikipediaSearchResult | null> {
    try {
      const searchUrl = `${this.baseUrl}/page/summary/${encodeURIComponent(chefName)}`;
      
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
}

// Export singleton instance
export const wikipediaService = new WikipediaService(); 