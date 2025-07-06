"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikipediaService = exports.WikipediaService = void 0;
class WikipediaService {
    constructor() {
        this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    }
    async searchChefs(query, limit = 10) {
        try {
            const searchUrl = `${this.baseUrl}/page/search?q=${encodeURIComponent(query + ' chef')}&limit=${limit}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                }
            });
            if (!response.ok) {
                throw new Error(`Wikipedia API error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.pages || data.pages.length === 0) {
                return [];
            }
            const chefNames = data.pages
                .filter(page => this.isLikelyChef(page.title, page.description || page.excerpt || ''))
                .map(page => this.extractChefName(page.title))
                .filter(name => name.length > 0)
                .slice(0, limit);
            return chefNames;
        }
        catch (error) {
            console.error('Wikipedia chef search failed:', error);
            throw error;
        }
    }
    isLikelyChef(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const chefIndicators = [
            'chef', 'cook', 'culinary', 'restaurant', 'kitchen', 'cuisine',
            'michelin', 'cookbook', 'recipe', 'food', 'gastronomy', 'culinary arts'
        ];
        const excludeIndicators = [
            'disambiguation', 'category:', 'list of', 'template:', 'user:',
            'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:'
        ];
        if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
            return false;
        }
        const hasChefIndicator = chefIndicators.some(indicator => titleLower.includes(indicator) || descLower.includes(indicator));
        const isPersonName = /^[A-Z][a-z]+ [A-Z][a-z]+/.test(title);
        return hasChefIndicator || isPersonName;
    }
    extractChefName(title) {
        let cleanName = title
            .replace(/\s*\(chef\)/gi, '')
            .replace(/\s*\(cook\)/gi, '')
            .replace(/\s*\(restaurateur\)/gi, '')
            .replace(/\s*\(American chef\)/gi, '')
            .replace(/\s*\(British chef\)/gi, '')
            .replace(/\s*\(French chef\)/gi, '')
            .replace(/\s*\(.*?\)/g, '')
            .trim();
        if (/^[A-Z][a-zA-Z'\-\s]+$/.test(cleanName) && cleanName.length >= 3) {
            return cleanName;
        }
        return '';
    }
    async getChefDetails(chefName) {
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
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Wikipedia chef details failed:', error);
            return null;
        }
    }
}
exports.WikipediaService = WikipediaService;
exports.wikipediaService = new WikipediaService();
//# sourceMappingURL=wikipediaService.js.map