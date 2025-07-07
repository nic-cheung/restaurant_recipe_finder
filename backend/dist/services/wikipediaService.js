"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikipediaService = exports.WikipediaService = void 0;
class WikipediaService {
    constructor() {
        this.baseUrl = 'https://en.wikipedia.org/w/api.php';
    }
    async searchChefs(query, limit = 10) {
        try {
            const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query + ' chef')}&srlimit=${limit * 2}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                }
            });
            if (!response.ok) {
                throw new Error(`Wikipedia API error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.query?.search || data.query.search.length === 0) {
                return [];
            }
            const verifiedChefs = [];
            for (const page of data.query.search) {
                if (verifiedChefs.length >= limit)
                    break;
                if (!this.isLikelyChef(page.title, page.snippet || '')) {
                    continue;
                }
                const cleanName = this.extractChefName(page.title);
                if (cleanName.length === 0) {
                    continue;
                }
                const isActualChef = await this.verifyIsChef(page.title);
                if (isActualChef) {
                    verifiedChefs.push(cleanName);
                }
            }
            return verifiedChefs;
        }
        catch (error) {
            console.error('Wikipedia chef search failed:', error);
            throw error;
        }
    }
    async searchCuisines(query, limit = 10) {
        try {
            const searchQueries = [
                `${query} cuisine`,
                query
            ];
            if (query.length >= 3 && query.length <= 5) {
                const patterns = [
                    `${query}aican`,
                    `${query}ican`,
                    `${query}ian`,
                    `${query}ese`,
                    `${query}ish`,
                    `${query}ean`
                ];
                for (const pattern of patterns) {
                    searchQueries.push(`${pattern} cuisine`);
                }
            }
            if (query.length >= 4) {
                for (let i = 3; i < query.length; i++) {
                    const shortQuery = query.substring(0, i);
                    searchQueries.push(`${shortQuery} cuisine`);
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
            let allResults = [];
            for (const searchQuery of searchQueries) {
                const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=${limit}`;
                const response = await fetch(searchUrl, {
                    headers: {
                        'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.query?.search && data.query.search.length > 0) {
                        allResults = allResults.concat(data.query.search);
                    }
                }
            }
            if (allResults.length === 0) {
                return [];
            }
            const uniqueResults = allResults.filter((result, index, self) => index === self.findIndex(r => r.pageid === result.pageid));
            const cuisineNames = uniqueResults
                .filter(page => this.isLikelyCuisine(page.title, page.snippet || ''))
                .map(page => this.extractCuisineName(page.title))
                .filter(name => name.length > 0 && this.isValidCuisineName(name))
                .filter(name => this.containsQuery(name, query))
                .slice(0, limit);
            return this.sortByRelevance(cuisineNames, query);
        }
        catch (error) {
            console.error('Wikipedia cuisine search failed:', error);
            throw error;
        }
    }
    async searchDishes(query, limit = 10) {
        try {
            const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit * 2}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                }
            });
            if (!response.ok) {
                throw new Error(`Wikipedia API error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.query?.search || data.query.search.length === 0) {
                return [];
            }
            const dishNames = data.query.search
                .filter(page => this.isLikelyDish(page.title, page.snippet || ''))
                .map(page => this.extractDishName(page.title))
                .filter(name => name.length > 0 && this.isValidDishName(name))
                .filter(name => this.containsQuery(name, query))
                .slice(0, limit);
            return this.sortByRelevance(dishNames, query);
        }
        catch (error) {
            console.error('Wikipedia dish search failed:', error);
            throw error;
        }
    }
    async searchIngredients(query, limit = 10) {
        try {
            const searchUrl = `${this.baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit * 2}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                }
            });
            if (!response.ok) {
                throw new Error(`Wikipedia API error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.query?.search || data.query.search.length === 0) {
                return [];
            }
            const ingredientNames = data.query.search
                .filter(page => this.isLikelyIngredient(page.title, page.snippet || ''))
                .map(page => this.extractIngredientName(page.title))
                .filter(name => name.length > 0 && this.isValidIngredientName(name))
                .filter(name => this.containsQuery(name, query))
                .slice(0, limit);
            return this.sortByRelevance(ingredientNames, query);
        }
        catch (error) {
            console.error('Wikipedia ingredient search failed:', error);
            throw error;
        }
    }
    isLikelyChef(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const excludeIndicators = [
            'disambiguation', 'category:', 'list of', 'template:', 'user:',
            'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:'
        ];
        if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
            return false;
        }
        const isPersonName = /^[A-Z][a-z]+(\s[A-Z][a-z]*)*\s[A-Z][a-z]+$/.test(title);
        if (!isPersonName) {
            return false;
        }
        const foodRelatedIndicators = [
            'chef', 'cook', 'culinary', 'restaurant', 'kitchen', 'cuisine',
            'michelin', 'cookbook', 'recipe', 'food', 'gastronomy', 'baking',
            'pastry', 'sommelier', 'wine', 'dining', 'menu', 'restaurateur'
        ];
        const hasFoodIndicator = foodRelatedIndicators.some(indicator => titleLower.includes(indicator) || descLower.includes(indicator));
        return hasFoodIndicator;
    }
    isLikelyCuisine(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const excludeIndicators = [
            'disambiguation', 'category:', 'list of', 'template:', 'user:',
            'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
            'restaurant', 'chef', 'cookbook', 'recipe', 'dish', 'ingredient',
            'food trends', 'social media', 'viral', 'history of', 'culture of',
            'outline of', 'food and drink'
        ];
        if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
            return false;
        }
        const cuisineIndicators = [
            'cuisine', 'culinary', 'cooking', 'food', 'gastronomy'
        ];
        const hasCuisineIndicator = cuisineIndicators.some(indicator => titleLower.includes(indicator) || descLower.includes(indicator));
        const isGeographicalCuisine = titleLower.includes('cuisine') ||
            (titleLower.includes('food') && titleLower.length <= 20);
        return hasCuisineIndicator || isGeographicalCuisine;
    }
    isLikelyDish(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const excludeIndicators = [
            'disambiguation', 'category:', 'list of', 'template:', 'user:',
            'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
            'restaurant', 'chef', 'cookbook', 'cuisine', 'ingredient', 'recipe',
            'cooking', 'food preparation', 'culinary', 'kitchen', 'diet',
            'nutrition', 'health', 'trends', 'tiktok', 'social media', 'viral',
            'national dish', 'traditional food', 'food culture', 'food history',
            'outline of', 'history of', 'culture of', 'food and drink'
        ];
        if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
            return false;
        }
        const dishIndicators = [
            'pasta', 'pizza', 'soup', 'salad', 'curry', 'noodles', 'bread',
            'cake', 'pie', 'stew', 'casserole', 'risotto', 'paella', 'sushi',
            'taco', 'burger', 'sandwich', 'omelet', 'frittata', 'quiche'
        ];
        const hasDishIndicator = dishIndicators.some(indicator => titleLower.includes(indicator) || descLower.includes(indicator));
        const words = title.split(' ');
        const isShortSpecificTitle = words.length <= 4 && words.length >= 2;
        const descriptionHasDishTerms = ['dish', 'food', 'prepared', 'cooked', 'served'].some(term => descLower.includes(term));
        return hasDishIndicator || (isShortSpecificTitle && descriptionHasDishTerms);
    }
    isLikelyIngredient(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const excludeIndicators = [
            'disambiguation', 'category:', 'list of', 'template:', 'user:',
            'file:', 'talk:', 'wikipedia:', 'help:', 'portal:', 'project:',
            'restaurant', 'chef', 'cookbook', 'cuisine', 'dish', 'recipe',
            'cooking', 'preparation', 'history of', 'culture of', 'outline of',
            'food trends', 'social media', 'viral'
        ];
        if (excludeIndicators.some(exclude => titleLower.includes(exclude))) {
            return false;
        }
        const ingredientIndicators = [
            'spice', 'herb', 'vegetable', 'fruit', 'grain', 'meat', 'fish',
            'dairy', 'oil', 'vinegar', 'seasoning', 'flavoring', 'condiment',
            'powder', 'extract', 'sauce', 'paste', 'ingredient', 'edible'
        ];
        const hasIngredientIndicator = ingredientIndicators.some(indicator => titleLower.includes(indicator) || descLower.includes(indicator));
        const words = title.split(' ');
        const isSimpleIngredient = words.length <= 2 && /^[A-Za-z\s-]+$/.test(title);
        return hasIngredientIndicator || isSimpleIngredient;
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
        const namePattern = /^[A-Z][a-z]+(\s[A-Z][a-z]*)*\s[A-Z][a-z]+$/;
        const invalidNames = [
            'roman empire', 'ancient rome', 'middle ages', 'renaissance',
            'modern era', 'contemporary', 'traditional', 'classic', 'fusion',
            'fine dining', 'fast food', 'street food', 'home cooking'
        ];
        const cleanNameLower = cleanName.toLowerCase();
        if (invalidNames.some(invalid => cleanNameLower.includes(invalid))) {
            return '';
        }
        if (namePattern.test(cleanName) && cleanName.length >= 5 && cleanName.length <= 50) {
            return cleanName;
        }
        return '';
    }
    extractCuisineName(title) {
        let cleanName = title
            .replace(/\s*cuisine$/gi, '')
            .replace(/\s*culinary$/gi, '')
            .replace(/\s*cooking$/gi, '')
            .replace(/\s*food$/gi, '')
            .replace(/\s*\(.*?\)/g, '')
            .trim();
        if (cleanName.length >= 3 && /^[A-Z][a-zA-Z\s\-]+$/.test(cleanName)) {
            return cleanName;
        }
        return '';
    }
    extractDishName(title) {
        let cleanName = title
            .replace(/\s*\(dish\)/gi, '')
            .replace(/\s*\(food\)/gi, '')
            .replace(/\s*\(recipe\)/gi, '')
            .replace(/\s*\(.*?\)/g, '')
            .trim();
        if (cleanName.length >= 2 && /^[A-Za-z][a-zA-Z\s\-']+$/.test(cleanName)) {
            return cleanName;
        }
        return '';
    }
    extractIngredientName(title) {
        let cleanName = title
            .replace(/\s*\(ingredient\)/gi, '')
            .replace(/\s*\(spice\)/gi, '')
            .replace(/\s*\(herb\)/gi, '')
            .replace(/\s*\(food\)/gi, '')
            .replace(/\s*\(.*?\)/g, '')
            .trim();
        if (cleanName.length >= 2 && /^[A-Za-z][a-zA-Z\s\-']+$/.test(cleanName)) {
            return cleanName;
        }
        return '';
    }
    async verifyIsChef(pageTitle) {
        try {
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
            const extractUrl = `${this.baseUrl}?action=query&format=json&prop=extracts&exintro=true&exsentences=1&explaintext=true&titles=${encodeURIComponent(pageTitle)}`;
            const response = await fetch(extractUrl, {
                headers: {
                    'User-Agent': 'RestaurantRecipeFinder/1.0 (https://github.com/your-repo) Node.js'
                }
            });
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            const pages = data.query?.pages;
            if (!pages)
                return false;
            const pageData = Object.values(pages)[0];
            const extract = pageData?.extract?.toLowerCase();
            if (!extract)
                return false;
            const chefPatterns = [
                /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*chef/i,
                /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*cook/i,
                /\bis an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning)?\s*restaurateur/i,
                /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*chef/i,
                /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning|executive|head|sous|pastry|tv|television)?\s*cook/i,
                /\bwas an?\s+(american|british|french|italian|japanese|chinese|indian|mexican|spanish|german|australian|canadian|korean|thai|vietnamese|lebanese|turkish|greek|brazilian|argentinian|peruvian|moroccan|ethiopian|nigerian|south african|new zealand|irish|scottish|welsh|dutch|belgian|swiss|austrian|polish|russian|scandinavian|nordic|celebrity|michelin-starred|renowned|famous|noted|acclaimed|award-winning)?\s*restaurateur/i
            ];
            const excludeFromExtract = [
                'television', 'tv show', 'reality show', 'cooking show', 'competition',
                'fictional', 'character', 'puppet', 'muppet', 'cartoon', 'animated',
                'series', 'program', 'show', 'broadcast', 'network'
            ];
            if (excludeFromExtract.some(exclude => extract.includes(exclude))) {
                return false;
            }
            return chefPatterns.some(pattern => pattern.test(extract));
        }
        catch (error) {
            console.error('Wikipedia verification failed:', error);
            return false;
        }
    }
    async getChefDetails(chefName) {
        try {
            const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(chefName)}`;
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
    isValidDishName(name) {
        const nameLower = name.toLowerCase();
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
        const peoplePatterns = [
            /^[A-Z][a-z]+ [A-Z][a-z]+$/,
            /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i,
            /\b(chef|cook|author|writer|actor|singer|player|athlete)\b/i
        ];
        if (peoplePatterns.some(pattern => pattern.test(name))) {
            return false;
        }
        const nonFoodTerms = [
            'tree', 'plant', 'animal', 'person', 'people', 'company', 'brand',
            'store', 'shop', 'restaurant', 'hotel', 'nuclear', 'physics',
            'chemistry', 'science', 'technology', 'politics', 'sports', 'game'
        ];
        if (nonFoodTerms.some(term => nameLower.includes(term))) {
            return false;
        }
        if (name.length < 3 || name.length > 50) {
            return false;
        }
        const singleGenericWords = [
            'pasta', 'rice', 'bread', 'soup', 'salad', 'meat', 'fish',
            'chicken', 'beef', 'pork', 'vegetable', 'fruit', 'dessert', 'curry'
        ];
        if (singleGenericWords.includes(nameLower)) {
            return false;
        }
        const foodIndicators = [
            'pasta', 'pizza', 'soup', 'salad', 'curry', 'noodles', 'bread',
            'cake', 'pie', 'stew', 'casserole', 'risotto', 'paella', 'sushi',
            'taco', 'burger', 'sandwich', 'omelet', 'frittata', 'quiche',
            'sauce', 'alla', 'con', 'de', 'du', 'with', 'and'
        ];
        const hasValidFoodIndicator = foodIndicators.some(indicator => nameLower.includes(indicator));
        const isMultiWordDish = name.split(' ').length >= 2;
        return hasValidFoodIndicator || isMultiWordDish;
    }
    isValidCuisineName(name) {
        const nameLower = name.toLowerCase();
        const genericTerms = [
            'cuisine', 'food', 'cooking', 'culinary', 'gastronomy',
            'restaurant', 'chef', 'cookbook', 'recipe', 'dish',
            'history', 'culture', 'outline', 'list', 'category'
        ];
        if (genericTerms.some(term => nameLower === term)) {
            return false;
        }
        const peoplePatterns = [
            /^[A-Z][a-z]+ [A-Z][a-z]+$/,
            /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i
        ];
        if (peoplePatterns.some(pattern => pattern.test(name))) {
            return false;
        }
        if (name.length < 3 || name.length > 30) {
            return false;
        }
        const validCuisineIndicators = [
            'asian', 'european', 'american', 'african', 'middle eastern',
            'mediterranean', 'fusion', 'traditional', 'modern', 'contemporary',
            'regional', 'ethnic', 'italian', 'french', 'chinese', 'japanese',
            'indian', 'thai', 'mexican', 'korean', 'vietnamese', 'turkish',
            'jamaican', 'caribbean', 'greek', 'spanish', 'german', 'british',
            'moroccan', 'lebanese', 'peruvian', 'brazilian', 'argentinian',
            'russian', 'polish', 'ethiopian', 'nigerian', 'filipino', 'indonesian'
        ];
        const hasValidIndicator = validCuisineIndicators.some(indicator => nameLower.includes(indicator) || indicator.includes(nameLower));
        const geographicalPattern = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;
        const isGeographical = geographicalPattern.test(name) && name.split(' ').length <= 3;
        return hasValidIndicator || isGeographical;
    }
    isValidIngredientName(name) {
        const nameLower = name.toLowerCase();
        const genericTerms = [
            'ingredient', 'spice', 'herb', 'seasoning', 'flavoring',
            'food', 'cooking', 'culinary', 'preparation', 'kitchen',
            'recipe', 'dish', 'cuisine', 'restaurant', 'chef',
            'history', 'culture', 'outline', 'list', 'category'
        ];
        if (genericTerms.some(term => nameLower === term)) {
            return false;
        }
        const peoplePatterns = [
            /^[A-Z][a-z]+ [A-Z][a-z]+$/,
            /^(Mr|Mrs|Ms|Dr|Chef|Sir)\s/i,
            /\b(chef|cook|author|writer|actor|singer|player|athlete)\b/i
        ];
        if (peoplePatterns.some(pattern => pattern.test(name))) {
            return false;
        }
        const nonIngredientTerms = [
            'farm', 'garden', 'company', 'brand', 'store', 'shop',
            'person', 'people', 'band', 'group', 'team', 'show'
        ];
        if (nonIngredientTerms.some(term => nameLower.includes(term))) {
            return false;
        }
        if (name.length < 3 || name.length > 25) {
            return false;
        }
        const validIngredientIndicators = [
            'oil', 'vinegar', 'sauce', 'powder', 'extract', 'seed', 'leaf',
            'root', 'berry', 'pepper', 'salt', 'sugar', 'flour', 'milk',
            'cheese', 'butter', 'cream', 'spice', 'herb', 'basil', 'oregano',
            'thyme', 'rosemary', 'garlic', 'onion', 'ginger', 'turmeric',
            'cumin', 'paprika', 'cinnamon', 'vanilla', 'chocolate'
        ];
        const hasValidIndicator = validIngredientIndicators.some(indicator => nameLower.includes(indicator) || indicator.includes(nameLower));
        const isSimpleIngredient = /^[a-z]+$/.test(nameLower) && name.split(' ').length === 1;
        return hasValidIndicator || isSimpleIngredient;
    }
    containsQuery(name, query) {
        if (!query.trim())
            return true;
        const nameLower = name.toLowerCase();
        const queryLower = query.toLowerCase();
        if (nameLower.includes(queryLower)) {
            return true;
        }
        if (nameLower.startsWith(queryLower)) {
            return true;
        }
        if (queryLower.length >= 4) {
            for (let i = 3; i < queryLower.length; i++) {
                const shortQuery = queryLower.substring(0, i);
                if (nameLower.startsWith(shortQuery)) {
                    return true;
                }
            }
        }
        const commonSuffixes = ['an', 'ian', 'ese', 'ish', 'ean'];
        for (const suffix of commonSuffixes) {
            if (nameLower.startsWith(queryLower + suffix)) {
                return true;
            }
        }
        return false;
    }
    sortByRelevance(suggestions, query) {
        if (!query.trim())
            return suggestions;
        const queryLower = query.toLowerCase();
        return suggestions.sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aExact = aLower === queryLower;
            const bExact = bLower === queryLower;
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
            const aStarts = aLower.startsWith(queryLower);
            const bStarts = bLower.startsWith(queryLower);
            if (aStarts && !bStarts)
                return -1;
            if (!aStarts && bStarts)
                return 1;
            const aIndex = aLower.indexOf(queryLower);
            const bIndex = bLower.indexOf(queryLower);
            if (aIndex !== bIndex)
                return aIndex - bIndex;
            if (a.length !== b.length)
                return a.length - b.length;
            return a.localeCompare(b);
        });
    }
}
exports.WikipediaService = WikipediaService;
exports.wikipediaService = new WikipediaService();
//# sourceMappingURL=wikipediaService.js.map