import { z } from 'zod';

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  location: z
    .string()
    .optional(),
  timezone: z
    .string()
    .optional(),
  dinnerTimePreference: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Dinner time must be in HH:MM format')
    .optional(),
  spiceTolerance: z
    .enum(['MILD', 'MEDIUM', 'HOT', 'EXTREME'])
    .optional(),
});

/**
 * User login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * User preferences validation schema
 */
export const userPreferencesSchema = z.object({
  dietaryRestrictions: z
    .array(z.string().min(1, 'Dietary restriction cannot be empty'))
    .max(20, 'Too many dietary restrictions')
    .optional()
    .default([]),
  allergies: z
    .array(z.string().min(1, 'Allergy cannot be empty'))
    .max(50, 'Too many allergies')
    .optional()
    .default([]),
  favoriteIngredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .max(100, 'Too many favorite ingredients')
    .optional()
    .default([]),
  dislikedFoods: z
    .array(z.string().min(1, 'Disliked food cannot be empty'))
    .max(100, 'Too many disliked foods')
    .optional()
    .default([]),
  favoriteCuisines: z
    .array(z.string().min(1, 'Cuisine cannot be empty'))
    .max(30, 'Too many favorite cuisines')
    .optional()
    .default([]),
  favoriteDishes: z
    .array(z.string().min(1, 'Dish cannot be empty'))
    .max(50, 'Too many favorite dishes')
    .optional()
    .default([]),
  favoriteChefs: z
    .array(z.string().min(1, 'Chef name cannot be empty'))
    .max(50, 'Too many favorite chefs')
    .optional()
    .default([]),
  favoriteRestaurants: z
    .array(z.string().min(1, 'Restaurant name cannot be empty'))
    .max(50, 'Too many favorite restaurants')
    .optional()
    .default([]),
  cookingSkillLevel: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .optional()
    .default('BEGINNER'),
  preferredCookingTime: z
    .number()
    .int('Cooking time must be an integer')
    .min(5, 'Cooking time must be at least 5 minutes')
    .max(480, 'Cooking time cannot exceed 8 hours')
    .nullable()
    .optional(),
  servingSize: z
    .number()
    .int('Serving size must be an integer')
    .min(1, 'Serving size must be at least 1')
    .max(20, 'Serving size cannot exceed 20')
    .nullable()
    .optional()
    .default(2),
  
  // New comprehensive preference fields
  nutritionalGoals: z
    .array(z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'HEART_HEALTHY', 'DIABETIC_FRIENDLY', 'LOW_SODIUM', 'HIGH_PROTEIN', 'LOW_CARB', 'HIGH_FIBER']))
    .max(5, 'Too many nutritional goals')
    .optional()
    .default([]),
  budgetPreference: z
    .enum(['BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY'])
    .optional()
    .default('MODERATE'),
  preferredMealTypes: z
    .array(z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'DESSERTS', 'APPETIZERS', 'BRUNCH', 'LATE_NIGHT']))
    .max(8, 'Too many meal types')
    .optional()
    .default([]),
  availableEquipment: z
    .array(z.enum(['OVEN', 'STOVETOP', 'MICROWAVE', 'GRILL', 'AIR_FRYER', 'SLOW_COOKER', 'PRESSURE_COOKER', 'BLENDER', 'FOOD_PROCESSOR', 'STAND_MIXER', 'TOASTER_OVEN', 'RICE_COOKER', 'STEAMER', 'DEEP_FRYER', 'SOUS_VIDE']))
    .max(15, 'Too many equipment items')
    .optional()
    .default([]),
  mealComplexity: z
    .enum(['ONE_POT', 'SIMPLE', 'MODERATE', 'COMPLEX', 'GOURMET'])
    .optional()
    .default('SIMPLE'),
});

/**
 * Partial user preferences schema for updates
 */
export const updateUserPreferencesSchema = userPreferencesSchema.partial();

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

// Common dietary restrictions for validation
export const COMMON_DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Low-Sodium',
  'Diabetic-Friendly',
  'Heart-Healthy',
  'Mediterranean',
  'Whole30',
  'Pescatarian',
  'Kosher',
  'Halal',
] as const;

// Common allergies for validation
export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
  'Mustard',
  'Celery',
  'Lupin',
  'Mollusks',
  'Sulfites',
] as const;

// Common cuisines for validation
export const COMMON_CUISINES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'French',
  'Greek',
  'Mediterranean',
  'American',
  'Korean',
  'Vietnamese',
  'Spanish',
  'Turkish',
  'Lebanese',
  'Moroccan',
  'Ethiopian',
  'Brazilian',
  'Peruvian',
  'British',
  'German',
  'Russian',
  'Caribbean',
  'Middle Eastern',
  'African',
] as const;

// Curated chefs for sophisticated food enthusiasts
export const COMMON_CHEFS = [
  // Michelin Star Legends & Fine Dining Masters
  'Joël Robuchon',
  'Alain Ducasse',
  'Thomas Keller',
  'Ferran Adrià',
  'René Redzepi',
  'Massimo Bottura',
  'Grant Achatz',
  'Heston Blumenthal',
  'Daniel Boulud',
  'Eric Ripert',
  'Jean-Georges Vongerichten',
  'Marco Pierre White',
  'Gordon Ramsay',
  'Alain Passard',
  'Pierre Gagnaire',
  
  // Japanese Masters
  'Jiro Yamamoto',
  'Yoshihiro Narisawa',
  'Hiroyuki Kanda',
  'Seiji Yamamoto',
  'Takagi Kazuo',
  'Hideki Ishikawa',
  'Nobu Matsuhisa',
  'Masaharu Morimoto',
  
  // Contemporary Innovators
  'David Chang',
  'Yotam Ottolenghi',
  'José Andrés',
  'Alice Waters',
  'Dan Barber',
  'Magnus Nilsson',
  'Alex Atala',
  'Virgilio Martínez',
  'Gastón Acurio',
  'Enrique Olvera',
  'Pim Techamuanvivit',
  'Dominique Crenn',
  'Alison Roman',
  
  // Regional & Cultural Specialists  
  'Gaggan Anand',
  'Mauro Colagreco',
  'Niki Nakayama',
  'Daniela Soto-Innes',
  'Asma Khan',
  'Manish Mehrotra',
  'Vineet Bhatia',
  'Hemant Oberoi',
  'Andre Chiang',
  'Tetsuya Wakuda',
  'Peter Gilmore',
  'Josh Niland',
  
  // European Masters
  'Heinz Beck',
  'Niko Romito',
  'Andoni Luis Aduriz',
  'Joan Roca',
  'Quique Dacosta',
  'Paco Roncero',
  'Emmanuel Renaut',
  'Yannick Alléno',
  'Anne-Sophie Pic',
  'Clare Smyth',
  'Jason Atherton',
  'Marcus Wareing'
] as const;

// Curated restaurants for sophisticated food enthusiasts
export const COMMON_RESTAURANTS = [
  // Michelin 3-Star & World's 50 Best
  'Noma',
  'The French Laundry',
  'Le Bernardin',
  'Eleven Madison Park',
  'Osteria Francescana',
  'Mirazur',
  'Asador Etxebarri',
  'Central',
  'Disfrutar',
  'Frantzén',
  'Maido',
  'Odette',
  'The Chairman',
  'Pujol',
  'Steirereck',
  'Don Julio',
  'Mugaritz',
  'Cosme',
  'Lyle\'s',
  'Septime',
  
  // Iconic Fine Dining
  'Per Se',
  'Alinea',
  'Masa',
  'Daniel',
  'Jean-Georges',
  'Le Bernardin',
  'Chez Panisse',
  'Spago',
  'Momofuku Ko',
  'Atelier Crenn',
  'Benu',
  'Manresa',
  'The Restaurant at Meadowood',
  'Saison',
  'SingleThread',
  
  // Japanese Excellence
  'Sukiyabashi Jiro',
  'Narisawa',
  'Ishikawa',
  'Kikunoi',
  'Ryugin',
  'Nihonryori RyuGin',
  'Sushi Saito',
  'Sushi Yoshitake',
  'Tempura Kondo',
  'Florilège',
  'L\'Effervescence',
  'Quintessence',
  
  // European Legends
  'L\'Ambroisie',
  'Guy Savoy',
  'L\'Astrance',
  'Alain Ducasse au Plaza Athénée',
  'Pierre Gagnaire',
  'Le Meurice',
  'Epicure',
  'Le Bristol',
  'Geranium',
  'Alchemist',
  'Jordnær',
  'Hof van Cleve',
  'The Jane',
  'Oud Sluis',
  'De Librije',
  
  // London & UK
  'Mountain',
  'The Ledbury',
  'Core by Clare Smyth',
  'Sketch',
  'Dinner by Heston Blumenthal',
  'Pollen Street Social',
  'Restaurant Gordon Ramsay',
  'Alain Ducasse at The Dorchester',
  'Fera at Claridge\'s',
  'Ikoyi',
  'Kitchen Table',
  'Da Terra',
  'The Clove Club',
  'Kol',
  'Brat',
  'St. John',
  'Barrafina',
  'Dishoom',
  'Hawksmoor',
  'Rules',
  'Simpson\'s in the Strand',
  
  // Spanish Innovation
  'El Celler de Can Roca',
  'Azurmendi',
  'Arzak',
  'Quique Dacosta',
  'ABaC',
  'Coque',
  'Nerua',
  'Etxanobe',
  
  // Italian Masters
  'Osteria Francescana',
  'Le Calandre',
  'Dal Pescatore',
  'La Pergola',
  'Piazza Duomo',
  'Reale',
  'Villa Crespi',
  'Il Luogo di Aimo e Nadia',
  
  // Asian Excellence
  'Gaggan',
  'Indian Accent',
  'Trishna',
  'Burnt Ends',
  'Jaan',
  'Restaurant André',
  'Waku Ghin',
  'Cut by Wolfgang Puck',
  'Amber',
  'Bo Innovation',
  'Lung King Heen',
  'T\'ang Court',
  
  // Americas Innovation
  'Pujol',
  'Quintonil',
  'Sud 777',
  'Rosetta',
  'Central',
  'Maido',
  'Astrid y Gastón',
  'Rafael',
  'Boragó',
  'Leo',
  'Tegui',
  'Parador La Huella',
  
  // Casual Excellence & Bistros
  'L\'Ami Jean',
  'Bistrot Paul Bert',
  'Le Comptoir du Relais',
  'Frenchie',
  'Le Chateaubriand',
  'Clamato',
  'Breizh Café',
  'Du Pain et des Idées',
  'Pierre Hermé',
  'Cedric Grolet',
  
  // Wine Country & Destination
  'Auberge du Soleil',
  'Bouchon Bistro',
  'Ad Hoc',
  'Oxbow Public Market',
  'Farmstead at Long Meadow Ranch',
  'Bottega',
  'Cyrus',
  'Madrona Manor',
  
  // Iconic Regional
  'Commander\'s Palace',
  'Café du Monde',
  'Mother\'s',
  'Cochon',
  'Herbsaint',
  'August',
  'Emeril\'s',
  'GW Fins',
  'Coop\'s Place',
  'Acme Oyster House'
] as const;

// Curated dishes for sophisticated food enthusiasts
export const COMMON_DISHES = [
  // Classic French
  'Coq au Vin',
  'Beef Bourguignon',
  'Bouillabaisse',
  'Ratatouille',
  'Cassoulet',
  'Duck Confit',
  'Escargots',
  'Foie Gras',
  'Soufflé',
  'Crème Brûlée',
  'Tarte Tatin',
  'Quiche Lorraine',
  'French Onion Soup',
  'Pot-au-Feu',
  'Blanquette de Veau',
  
  // Italian Classics
  'Risotto Milanese',
  'Osso Buco',
  'Carbonara',
  'Cacio e Pepe',
  'Amatriciana',
  'Bolognese',
  'Puttanesca',
  'Aglio e Olio',
  'Margherita Pizza',
  'Tiramisu',
  'Panna Cotta',
  'Gelato',
  'Bruschetta',
  'Caprese Salad',
  'Vitello Tonnato',
  
  // Japanese Cuisine
  'Sushi',
  'Sashimi',
  'Tempura',
  'Ramen',
  'Udon',
  'Soba',
  'Yakitori',
  'Teriyaki',
  'Miso Soup',
  'Chirashi',
  'Katsu',
  'Gyoza',
  'Takoyaki',
  'Okonomiyaki',
  'Mochi',
  
  // Chinese Classics
  'Peking Duck',
  'Kung Pao Chicken',
  'Sweet and Sour Pork',
  'Ma Po Tofu',
  'Dim Sum',
  'Xiaolongbao',
  'Fried Rice',
  'Chow Mein',
  'Hot Pot',
  'Wontons',
  'Spring Rolls',
  'General Tso\'s Chicken',
  'Orange Chicken',
  'Beef and Broccoli',
  'Egg Drop Soup',
  
  // Indian Specialties
  'Butter Chicken',
  'Tikka Masala',
  'Biryani',
  'Curry',
  'Tandoori Chicken',
  'Samosas',
  'Naan',
  'Dal',
  'Palak Paneer',
  'Vindaloo',
  'Korma',
  'Masala Dosa',
  'Chana Masala',
  'Lamb Rogan Josh',
  'Gulab Jamun',
  
  // Thai Favorites
  'Pad Thai',
  'Green Curry',
  'Red Curry',
  'Tom Yum Soup',
  'Tom Kha Gai',
  'Massaman Curry',
  'Pad See Ew',
  'Larb',
  'Som Tam',
  'Mango Sticky Rice',
  'Thai Basil Chicken',
  'Pad Kra Pao',
  'Satay',
  'Thai Fried Rice',
  'Papaya Salad',
  
  // Mexican Classics
  'Tacos',
  'Burritos',
  'Quesadillas',
  'Enchiladas',
  'Tamales',
  'Pozole',
  'Mole',
  'Chiles Rellenos',
  'Carnitas',
  'Carne Asada',
  'Guacamole',
  'Salsa',
  'Elote',
  'Churros',
  'Tres Leches Cake',
  
  // Mediterranean
  'Hummus',
  'Falafel',
  'Tabbouleh',
  'Baba Ganoush',
  'Shawarma',
  'Kebabs',
  'Dolmas',
  'Tzatziki',
  'Moussaka',
  'Spanakopita',
  'Paella',
  'Gazpacho',
  'Baklava',
  'Greek Salad',
  'Souvlaki',
  
  // American Classics
  'Hamburger',
  'Hot Dog',
  'Mac and Cheese',
  'Fried Chicken',
  'BBQ Ribs',
  'Clam Chowder',
  'Lobster Roll',
  'Cheesesteak',
  'Buffalo Wings',
  'Apple Pie',
  'Chocolate Chip Cookies',
  'Pancakes',
  'Waffles',
  'Eggs Benedict',
  'Caesar Salad',
  
  // Modern Fusion
  'Poke Bowl',
  'Ramen Burger',
  'Korean BBQ Tacos',
  'Sushi Pizza',
  'Truffle Mac and Cheese',
  'Deconstructed Dishes',
  'Molecular Gastronomy',
  'Foam Dishes',
  'Sous Vide Preparations',
  'Smoked Cocktails',
  'Liquid Nitrogen Desserts',
  'Edible Flowers',
  'Microgreens',
  'Artisanal Everything',
  'Plant-Based Meats',
  
  // Comfort Food
  'Chicken Soup',
  'Grilled Cheese',
  'Meatloaf',
  'Shepherd\'s Pie',
  'Pot Roast',
  'Mashed Potatoes',
  'Biscuits and Gravy',
  'Chicken and Waffles',
  'Fish and Chips',
  'Bangers and Mash',
  'Cottage Pie',
  'Beef Stew',
  'Chicken Pot Pie',
  'Tuna Melt',
  'Grilled Salmon',
  
  // Breakfast & Brunch
  'Eggs Benedict',
  'French Toast',
  'Pancakes',
  'Waffles',
  'Omelette',
  'Avocado Toast',
  'Shakshuka',
  'Huevos Rancheros',
  'Breakfast Burrito',
  'Bagel and Lox',
  'Croissant',
  'Danish Pastry',
  'Muffins',
  'Scones',
  'Granola',
  
  // Desserts
  'Chocolate Soufflé',
  'Crème Brûlée',
  'Tiramisu',
  'Cheesecake',
  'Chocolate Cake',
  'Ice Cream',
  'Sorbet',
  'Macarons',
  'Profiteroles',
  'Tarte Tatin',
  'Bread Pudding',
  'Panna Cotta',
  'Flan',
  'Mousse',
  'Gelato'
] as const;

// Comprehensive ingredient list for sophisticated cooking
export const COMMON_INGREDIENTS = [
  // Proteins
  'Chicken',
  'Beef',
  'Pork',
  'Lamb',
  'Turkey',
  'Duck',
  'Salmon',
  'Tuna',
  'Cod',
  'Halibut',
  'Shrimp',
  'Lobster',
  'Crab',
  'Scallops',
  'Mussels',
  'Oysters',
  'Tofu',
  'Tempeh',
  'Seitan',
  'Eggs',
  
  // Vegetables
  'Onions',
  'Garlic',
  'Tomatoes',
  'Bell Peppers',
  'Carrots',
  'Celery',
  'Potatoes',
  'Sweet Potatoes',
  'Broccoli',
  'Cauliflower',
  'Spinach',
  'Kale',
  'Arugula',
  'Lettuce',
  'Mushrooms',
  'Zucchini',
  'Eggplant',
  'Asparagus',
  'Brussels Sprouts',
  'Cabbage',
  'Leeks',
  'Fennel',
  'Artichokes',
  'Avocados',
  'Cucumbers',
  'Radishes',
  'Beets',
  'Turnips',
  'Parsnips',
  'Corn',
  'Peas',
  'Green Beans',
  'Okra',
  'Chard',
  'Collard Greens',
  
  // Herbs & Aromatics
  'Basil',
  'Oregano',
  'Thyme',
  'Rosemary',
  'Sage',
  'Parsley',
  'Cilantro',
  'Dill',
  'Chives',
  'Tarragon',
  'Mint',
  'Bay Leaves',
  'Marjoram',
  'Lemongrass',
  'Ginger',
  'Turmeric',
  'Galangal',
  'Shallots',
  'Scallions',
  'Chili Peppers',
  'Jalapeños',
  'Serrano Peppers',
  'Habaneros',
  'Chipotle',
  'Poblano',
  'Anaheim Peppers',
  
  // Spices & Seasonings
  'Salt',
  'Black Pepper',
  'White Pepper',
  'Paprika',
  'Cumin',
  'Coriander',
  'Cardamom',
  'Cinnamon',
  'Nutmeg',
  'Cloves',
  'Allspice',
  'Star Anise',
  'Fennel Seeds',
  'Mustard Seeds',
  'Sesame Seeds',
  'Poppy Seeds',
  'Caraway Seeds',
  'Turmeric',
  'Saffron',
  'Sumac',
  'Za\'atar',
  'Garam Masala',
  'Curry Powder',
  'Chinese Five Spice',
  'Herbes de Provence',
  'Italian Seasoning',
  'Cajun Seasoning',
  'Chili Powder',
  'Smoked Paprika',
  'Cayenne Pepper',
  'Red Pepper Flakes',
  'Vanilla',
  'Cocoa Powder',
  
  // Grains & Starches
  'Rice',
  'Quinoa',
  'Bulgur',
  'Couscous',
  'Farro',
  'Barley',
  'Oats',
  'Wheat',
  'Rye',
  'Buckwheat',
  'Millet',
  'Amaranth',
  'Pasta',
  'Noodles',
  'Bread',
  'Flour',
  'Cornmeal',
  'Polenta',
  'Semolina',
  'Breadcrumbs',
  
  // Legumes & Nuts
  'Black Beans',
  'Kidney Beans',
  'Chickpeas',
  'Lentils',
  'Split Peas',
  'Navy Beans',
  'Pinto Beans',
  'Lima Beans',
  'Cannellini Beans',
  'Edamame',
  'Almonds',
  'Walnuts',
  'Pecans',
  'Hazelnuts',
  'Pistachios',
  'Cashews',
  'Macadamia Nuts',
  'Pine Nuts',
  'Peanuts',
  'Chestnuts',
  'Brazil Nuts',
  'Sunflower Seeds',
  'Pumpkin Seeds',
  'Chia Seeds',
  'Flax Seeds',
  'Hemp Seeds',
  
  // Dairy & Alternatives
  'Butter',
  'Milk',
  'Cream',
  'Yogurt',
  'Cheese',
  'Mozzarella',
  'Parmesan',
  'Cheddar',
  'Goat Cheese',
  'Feta',
  'Ricotta',
  'Mascarpone',
  'Cream Cheese',
  'Sour Cream',
  'Crème Fraîche',
  'Coconut Milk',
  'Almond Milk',
  'Oat Milk',
  'Soy Milk',
  'Cashew Cream',
  'Nutritional Yeast',
  
  // Oils & Fats
  'Olive Oil',
  'Extra Virgin Olive Oil',
  'Coconut Oil',
  'Avocado Oil',
  'Sesame Oil',
  'Vegetable Oil',
  'Canola Oil',
  'Sunflower Oil',
  'Grapeseed Oil',
  'Walnut Oil',
  'Truffle Oil',
  'Ghee',
  'Lard',
  'Duck Fat',
  'Bacon Fat',
  
  // Acids & Vinegars
  'Lemon',
  'Lime',
  'Orange',
  'Grapefruit',
  'White Wine Vinegar',
  'Red Wine Vinegar',
  'Balsamic Vinegar',
  'Apple Cider Vinegar',
  'Rice Vinegar',
  'Sherry Vinegar',
  'Champagne Vinegar',
  'Malt Vinegar',
  'Tamarind',
  'Sumac',
  'Verjuice',
  
  // Sweeteners
  'Sugar',
  'Brown Sugar',
  'Honey',
  'Maple Syrup',
  'Agave',
  'Molasses',
  'Coconut Sugar',
  'Date Syrup',
  'Stevia',
  'Erythritol',
  'Xylitol',
  'Monk Fruit',
  
  // Condiments & Sauces
  'Soy Sauce',
  'Fish Sauce',
  'Worcestershire Sauce',
  'Hot Sauce',
  'Sriracha',
  'Harissa',
  'Chimichurri',
  'Pesto',
  'Tahini',
  'Miso',
  'Hoisin Sauce',
  'Oyster Sauce',
  'Teriyaki Sauce',
  'Barbecue Sauce',
  'Ketchup',
  'Mustard',
  'Dijon Mustard',
  'Whole Grain Mustard',
  'Mayonnaise',
  'Aioli',
  'Hollandaise',
  'Béarnaise',
  'Chimichurri',
  'Salsa Verde',
  'Tapenade',
  'Chutney',
  'Relish',
  'Pickles',
  'Capers',
  'Olives',
  'Anchovies',
  'Sun-dried Tomatoes',
  'Roasted Red Peppers',
  
  // Specialty & Gourmet
  'Truffle',
  'Caviar',
  'Foie Gras',
  'Uni',
  'Wagyu Beef',
  'Iberico Ham',
  'Prosciutto',
  'Pancetta',
  'Guanciale',
  'Bresaola',
  'Chorizo',
  'Merguez',
  'Andouille',
  'Boudin',
  'Confit',
  'Rillettes',
  'Pâté',
  'Terrine',
  'Charcuterie',
  'Artisanal Cheese',
  'Aged Cheese',
  'Raw Milk Cheese',
  'Specialty Vinegars',
  'Infused Oils',
  'Exotic Spices',
  'Heirloom Varieties',
  'Microgreens',
  'Edible Flowers',
  'Molecular Ingredients',
  'Liquid Nitrogen',
  'Agar',
  'Xanthan Gum',
  'Lecithin'
] as const;

// Nutritional goals options
export const NUTRITIONAL_GOALS = [
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'MAINTENANCE',
  'HEART_HEALTHY',
  'DIABETIC_FRIENDLY',
  'LOW_SODIUM',
  'HIGH_PROTEIN',
  'LOW_CARB',
  'HIGH_FIBER'
] as const;

// Budget preference options
export const BUDGET_PREFERENCES = [
  'BUDGET',
  'MODERATE',
  'PREMIUM',
  'LUXURY'
] as const;

// Meal type options
export const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACKS',
  'DESSERTS',
  'APPETIZERS',
  'BRUNCH',
  'LATE_NIGHT'
] as const;

// Cooking equipment options
export const COOKING_EQUIPMENT = [
  'OVEN',
  'STOVETOP',
  'MICROWAVE',
  'GRILL',
  'AIR_FRYER',
  'SLOW_COOKER',
  'PRESSURE_COOKER',
  'BLENDER',
  'FOOD_PROCESSOR',
  'STAND_MIXER',
  'TOASTER_OVEN',
  'RICE_COOKER',
  'STEAMER',
  'DEEP_FRYER',
  'SOUS_VIDE'
] as const;

// Meal complexity options
export const MEAL_COMPLEXITY = [
  'ONE_POT',
  'SIMPLE',
  'MODERATE',
  'COMPLEX',
  'GOURMET'
] as const;

// Spice tolerance options
export const SPICE_TOLERANCE = [
  'MILD',
  'MEDIUM',
  'HOT',
  'EXTREME'
] as const; 