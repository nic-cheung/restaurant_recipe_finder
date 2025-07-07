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
    .array(z.enum([
      // Core Goals
      'WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE',
      // Health Conditions  
      'HEART_HEALTHY', 'DIABETIC_FRIENDLY', 'LOW_SODIUM', 'HIGH_PROTEIN', 'LOW_CARB', 'HIGH_FIBER',
      // Popular 2024-2025 Health Trends
      'ANTI_INFLAMMATORY', 'GUT_HEALTH', 'HORMONE_BALANCE', 'ENERGY_BOOST', 'IMMUNE_SUPPORT', 'BRAIN_HEALTH', 'LONGEVITY', 'METABOLISM_BOOST', 'STRESS_REDUCTION', 'SLEEP_IMPROVEMENT',
      // Specific Dietary Approaches
      'INTERMITTENT_FASTING', 'PLANT_BASED', 'MEDITERRANEAN', 'KETO_FRIENDLY', 'PALEO_FRIENDLY', 'WHOLE30_COMPATIBLE',
      // Performance & Lifestyle
      'ATHLETIC_PERFORMANCE', 'POST_WORKOUT_RECOVERY', 'PRENATAL_NUTRITION', 'HEALTHY_AGING', 'DETOX_SUPPORT', 'BONE_HEALTH', 'SKIN_HEALTH', 'DIGESTIVE_HEALTH'
    ]))
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
    .array(z.enum([
      // Basic Equipment
      'OVEN', 'STOVETOP', 'MICROWAVE',
      // Grilling & Outdoor
      'GRILL', 'OUTDOOR_SMOKER', 'PIZZA_OVEN', 'FIRE_PIT',
      // Modern Appliances
      'AIR_FRYER', 'CONVECTION_OVEN', 'TOASTER_OVEN', 'COUNTERTOP_CONVECTION',
      // Slow & Pressure Cooking
      'SLOW_COOKER', 'PRESSURE_COOKER', 'INSTANT_POT', 'DUTCH_OVEN', 'TAGINE',
      // Food Processing
      'BLENDER', 'HIGH_SPEED_BLENDER', 'IMMERSION_BLENDER', 'FOOD_PROCESSOR', 'STAND_MIXER', 'HAND_MIXER', 'MORTAR_PESTLE',
      // Specialized Cooking
      'RICE_COOKER', 'STEAMER', 'BAMBOO_STEAMER', 'ELECTRIC_STEAMER', 'DEEP_FRYER', 'SOUS_VIDE', 'DEHYDRATOR', 'FERMENTATION_CROCK',
      // Professional & Specialty Tools
      'MANDOLINE_SLICER', 'SPIRALIZER', 'JUICER', 'ESPRESSO_MACHINE', 'BREAD_MAKER', 'PASTA_MACHINE', 'ICE_CREAM_MAKER', 'YOGURT_MAKER', 'WAFFLE_MAKER', 'PANCAKE_GRIDDLE', 'CREPE_MAKER', 'FONDUE_POT',
      // Grilling & Specialty
      'INDOOR_GRILL', 'PANINI_PRESS', 'SANDWICH_MAKER', 'ELECTRIC_WOK', 'INDUCTION_COOKTOP', 'PORTABLE_BURNER',
      // Baking & Pastry
      'KITCHEN_SCALE', 'DOUGH_MIXER', 'PROOFING_BASKET', 'BAKING_STONE', 'SHEET_PAN', 'CAST_IRON_SKILLET', 'CARBON_STEEL_PAN', 'COPPER_COOKWARE',
      // Modern Tech
      'SMART_THERMOMETER', 'VACUUM_SEALER', 'SMOKING_GUN', 'CULINARY_TORCH', 'NITROUS_OXIDE_WHIPPER',
      // Essential Tools
      'CHEF_KNIFE', 'CUTTING_BOARD', 'MIXING_BOWLS', 'MEASURING_CUPS', 'KITCHEN_THERMOMETER'
    ]))
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
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'Keto',
  'Paleo',
  'low-carb',
  'low-fat',
  'low-sodium',
  'diabetic-friendly',
  'heart-healthy',
  'Mediterranean',
  'Whole30',
  'pescatarian',
  'Kosher',
  'Halal',
] as const;

// Common allergies for validation
export const COMMON_ALLERGIES = [
  'peanuts',
  'tree nuts',
  'nuts',
  'milk',
  'dairy',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'wheat',
  'gluten',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'mollusks',
  'sulfites',
  'lactose',
  'corn',
  'citrus',
] as const;

// Enhanced cuisines from public datasets (World Wide Dishes, WorldCuisines, OpenNutrition, WorldFood.Guide)
export const COMMON_CUISINES = [
  // Core popular cuisines
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
  
  // Enhanced regional cuisines
  'Cantonese',
  'Sichuan',
  'Asian Fusion',
  'Modern American',
  'Tex-Mex',
  'Hunan',
  'Taiwanese',
  'Malaysian',
  'Persian',
  'Portuguese',
  'Belgian',
  'Nordic',
  'Scandinavian',
  'Argentinian',
  'Latin Fusion',
  'Mediterranean Fusion',
  'New Nordic',
  'Californian',
  'Filipino',
  'Indonesian',
  'Singaporean',
  'Pakistani',
  'Egyptian',
  'Israeli',
  'Syrian',
  'Dutch',
  'Swiss',
  'Austrian',
  'Hungarian',
  'Polish',
  'Nigerian',
  'South African',
  'Chilean',
  'Colombian',
  'Cuban',
  'Jamaican',
  'Cajun',
  'Creole',
  'Soul Food',
  'Nepalese',
  'Sri Lankan',
  'Bangladeshi',
  'Tunisian',
  'Algerian',
  'Jordanian',
  'Iraqi',
  'Czech',
  'Romanian',
  'Bulgarian',
  'Croatian',
  'Serbian',
  'Ghanaian',
  'Kenyan',
  'Senegalese',
  'Venezuelan',
  'Ecuadorian',
  'Puerto Rican',
  'Dominican',
  'Ivorian',
  'Bolivian',
  'Uruguayan',
  'Paraguayan'
] as const;

// Enhanced chefs from public datasets (World Wide Dishes, WorldCuisines, OpenNutrition, WorldFood.Guide)
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
  'Jiro Ono',
  'Yoshihiro Narisawa',
  'Hiroyuki Kanda',
  'Seiji Yamamoto',
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
  'Hélène Darroze',
  'Clare Smyth',
  'Jason Atherton',
  'Marcus Wareing',
  
  // Enhanced additions from global culinary scene
  'Hiroshi Nakamura',
  'Kenji López-Alt',
  'Andrea Petrini',
  'Corey Lee',
  'Roy Choi',
  'Peter Chang',
  'Ivan Orkin',
  'Kristen Kish',
  'Noma Team',
  'Björn Frantzén',
  'Ana Roš',
  'Esben Holmboe Bang',
  'Rasmus Kofoed',
  'Victor Arguinzoniz',
  'Dani García',
  'Paco Pérez',
  'Sami Tamimi',
  'Einat Admony',
  'Michael Solomonov',
  'Alon Shaya',
  'Marcus Samuelsson',
  'Pierre Thiam',
  'Kwame Onwuachi',
  'Pía León',
  'Mitsuharu Tsumura',
  'Helena Rizzo',
  'Pujol Team',
  'Aarón Sánchez',
  
  // Celebrity & TV Chefs
  'Anthony Bourdain',
  'Julia Child',
  'Jacques Pépin',
  'Ina Garten',
  'Martha Stewart',
  'Rachael Ray',
  'Emeril Lagasse',
  'Bobby Flay',
  'Giada De Laurentiis',
  'Mario Batali'
] as const;

// Enhanced restaurants from public datasets (World Wide Dishes, WorldCuisines, OpenNutrition, WorldFood.Guide)
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
  'Quintonil',
  'Sud 777',
  'Rosetta',
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
  
  // Popular & Accessible Chains
  'Chipotle',
  'Olive Garden',
  'Cheesecake Factory',
  'In-N-Out Burger',
  'Shake Shack',
  'Panera Bread',
  'Sweetgreen',
  'P.F. Chang\'s',
  'Benihana',
  'The Capital Grille',
  'Ruth\'s Chris Steak House',
  'Morton\'s The Steakhouse',
  
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
  'Acme Oyster House',
  
  // Enhanced additions from global dining scene
  'n/naka',
  'Kogi BBQ',
  'A Casa do Porco',
  'D.O.M.',
  'Manu',
  'Five Guys',
  'Qdoba',
  'Panda Express',
  'Pei Wei Asian Kitchen',
  'Nando\'s',
  'Wagamama',
  'Yo! Sushi',
  'Outback Steakhouse',
  'Texas Roadhouse',
  'Red Lobster',
  'Applebee\'s',
  'TGI Friday\'s',
  'Chili\'s',
  'Starbucks',
  'Dunkin\'',
  'Pret A Manger',
  'Costa Coffee',
  'Tim Hortons'
] as const;

// Enhanced dishes from public datasets (World Wide Dishes, WorldCuisines, OpenNutrition, WorldFood.Guide)
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
  'French onion soup',
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
  'pizza margherita',
  'Tiramisu',
  'Panna Cotta',
  'gelato',
  'Bruschetta',
  'Caprese salad',
  'Vitello Tonnato',
  
  // Japanese Cuisine
  'sushi',
  'sashimi',
  'tempura',
  'ramen',
  'udon',
  'soba',
  'yakitori',
  'teriyaki',
  'miso soup',
  'chirashi',
  'katsu',
  'gyoza',
  'takoyaki',
  'okonomiyaki',
  'mochi',
  
  // Chinese Classics
  'Peking Duck',
  'Kung Pao Chicken',
  'sweet and sour pork',
  'Ma Po Tofu',
  'dim sum',
  'Xiaolongbao',
  'fried rice',
  'chow mein',
  'hot pot',
  'wontons',
  'spring rolls',
  'General Tso\'s Chicken',
  'orange chicken',
  'beef and broccoli',
  'egg drop soup',
  
  // Indian Specialties
  'butter chicken',
  'tikka masala',
  'biryani',
  'curry',
  'tandoori chicken',
  'samosas',
  'naan',
  'dal',
  'palak paneer',
  'vindaloo',
  'korma',
  'masala dosa',
  'chana masala',
  'lamb rogan josh',
  'gulab jamun',
  
  // Thai Favorites
  'Pad Thai',
  'green curry',
  'red curry',
  'Tom Yum soup',
  'Tom Kha Gai',
  'Massaman curry',
  'Pad See Ew',
  'Larb',
  'Som Tam',
  'mango sticky rice',
  'Thai basil chicken',
  'Pad Kra Pao',
  'satay',
  'Thai fried rice',
  'papaya salad',
  
  // Mexican Classics
  'tacos',
  'burritos',
  'quesadillas',
  'enchiladas',
  'tamales',
  'pozole',
  'mole',
  'chiles rellenos',
  'carnitas',
  'carne asada',
  'guacamole',
  'salsa',
  'elote',
  'churros',
  'tres leches cake',
  
  // Mediterranean
  'hummus',
  'falafel',
  'tabbouleh',
  'baba ganoush',
  'shawarma',
  'kebabs',
  'dolmas',
  'tzatziki',
  'moussaka',
  'spanakopita',
  'paella',
  'gazpacho',
  'baklava',
  'Greek salad',
  'souvlaki',
  
  // American Classics
  'hamburger',
  'hot dog',
  'mac and cheese',
  'fried chicken',
  'BBQ ribs',
  'clam chowder',
  'lobster roll',
  'cheesesteak',
  'buffalo wings',
  'apple pie',
  'chocolate chip cookies',
  'pancakes',
  'waffles',
  'eggs benedict',
  'Caesar salad',
  
  // Modern Fusion
  'poke bowl',
  'ramen burger',
  'Korean BBQ tacos',
  'sushi pizza',
  'truffle mac and cheese',
  'bao buns',
  'fusion noodles',
  'Asian fusion salad',
  'kimchi fried rice',
  'miso glazed salmon',
  'curry pizza',
  'Thai basil pasta',
  'bulgogi burger',
  'ramen carbonara',
  'Vietnamese banh mi',
  
  // Comfort Food
  'chicken soup',
  'grilled cheese',
  'meatloaf',
  'shepherd\'s pie',
  'pot roast',
  'mashed potatoes',
  'biscuits and gravy',
  'chicken and waffles',
  'fish and chips',
  'bangers and mash',
  'cottage pie',
  'beef stew',
  'chicken pot pie',
  'tuna melt',
  'grilled salmon',
  
  // Breakfast & Brunch
  'French toast',
  'omelette',
  'avocado toast',
  'shakshuka',
  'huevos rancheros',
  'breakfast burrito',
  'bagel and lox',
  'croissant',
  'Danish pastry',
  'muffins',
  'scones',
  'granola',
  
  // Desserts
  'chocolate soufflé',
  'cheesecake',
  'chocolate cake',
  'ice cream',
  'sorbet',
  'macarons',
  'profiteroles',
  'bread pudding',
  'flan',
  'mousse',
  
  // Enhanced global dishes from public datasets
  'pho',
  'banh mi',
  'bibimbap',
  'bulgogi',
  'kimchi',
  'rendang',
  'nasi goreng',
  'laksa',
  'char kway teow',
  'Hainanese chicken rice',
  'adobo',
  'lumpia',
  'mapo tofu',
  'ceviche',
  'empanadas',
  'lomo saltado',
  'asado',
  'feijoada',
  'brigadeiro',
  'arepa',
  'bandeja paisa',
  'ropa vieja',
  'mofongo',
  'jerk chicken',
  'tagine',
  'couscous',
  'harira',
  'ful medames',
  'koshari',
  'Jamón Ibérico',
  'bratwurst',
  'sauerbraten',
  'pierogi',
  'goulash',
  'schnitzel',
  'stroopwafel',
  'moules frites',
  'jollof rice',
  'injera',
  'doro wat',
  'bobotie',
  'bunny chow',
  'thieboudienne',
  'chimichurri',
  'sushi burrito',
  'bánh mì burger'
] as const;

// Comprehensive ingredient list for sophisticated cooking
export const COMMON_INGREDIENTS = [
  // Proteins
  'chicken',
  'beef',
  'pork',
  'lamb',
  'turkey',
  'duck',
  'salmon',
  'tuna',
  'cod',
  'halibut',
  'shrimp',
  'lobster',
  'crab',
  'scallops',
  'mussels',
  'oysters',
  'tofu',
  'tempeh',
  'seitan',
  'eggs',
  
  // Vegetables
  'onions',
  'garlic',
  'tomatoes',
  'bell peppers',
  'carrots',
  'celery',
  'potatoes',
  'sweet potatoes',
  'broccoli',
  'cauliflower',
  'spinach',
  'kale',
  'arugula',
  'lettuce',
  'mushrooms',
  'zucchini',
  'eggplant',
  'asparagus',
  'Brussels sprouts',
  'cabbage',
  'leeks',
  'fennel',
  'artichokes',
  'avocados',
  'cucumbers',
  'radishes',
  'beets',
  'turnips',
  'parsnips',
  'corn',
  'peas',
  'green beans',
  'okra',
  'chard',
  'collard greens',
  
  // Herbs & Aromatics
  'basil',
  'oregano',
  'thyme',
  'rosemary',
  'sage',
  'parsley',
  'cilantro',
  'dill',
  'chives',
  'tarragon',
  'mint',
  'bay leaves',
  'marjoram',
  'lemongrass',
  'ginger',
  'turmeric',
  'galangal',
  'shallots',
  'scallions',
  'chili peppers',
  'jalapeños',
  'serrano peppers',
  'habaneros',
  'chipotle',
  'poblano',
  'Anaheim peppers',
  
  // Spices & Seasonings
  'salt',
  'black pepper',
  'white pepper',
  'paprika',
  'cumin',
  'coriander',
  'cardamom',
  'cinnamon',
  'nutmeg',
  'cloves',
  'allspice',
  'star anise',
  'fennel seeds',
  'mustard seeds',
  'sesame seeds',
  'poppy seeds',
  'caraway seeds',
  'turmeric',
  'saffron',
  'sumac',
  'za\'atar',
  'garam masala',
  'curry powder',
  'Chinese five spice',
  'herbes de Provence',
  'Italian seasoning',
  'Cajun seasoning',
  'chili powder',
  'smoked paprika',
  'cayenne pepper',
  'red pepper flakes',
  'vanilla',
  'cocoa powder',
  
  // Grains & Starches
  'rice',
  'quinoa',
  'bulgur',
  'couscous',
  'farro',
  'barley',
  'oats',
  'wheat',
  'rye',
  'buckwheat',
  'millet',
  'amaranth',
  'pasta',
  'noodles',
  'bread',
  'flour',
  'cornmeal',
  'polenta',
  'semolina',
  'breadcrumbs',
  
  // Legumes & Nuts
  'black beans',
  'kidney beans',
  'chickpeas',
  'lentils',
  'split peas',
  'navy beans',
  'pinto beans',
  'lima beans',
  'cannellini beans',
  'edamame',
  'almonds',
  'walnuts',
  'pecans',
  'hazelnuts',
  'pistachios',
  'cashews',
  'macadamia nuts',
  'pine nuts',
  'peanuts',
  'chestnuts',
  'Brazil nuts',
  'sunflower seeds',
  'pumpkin seeds',
  'chia seeds',
  'flax seeds',
  'hemp seeds',
  
  // Dairy & Alternatives
  'butter',
  'milk',
  'cream',
  'yogurt',
  'cheese',
  'mozzarella',
  'Parmesan',
  'Cheddar',
  'goat cheese',
  'Feta',
  'ricotta',
  'mascarpone',
  'cream cheese',
  'sour cream',
  'crème fraîche',
  'coconut milk',
  'almond milk',
  'oat milk',
  'soy milk',
  'cashew cream',
  'nutritional yeast',
  
  // Oils & Fats
  'olive oil',
  'extra virgin olive oil',
  'coconut oil',
  'avocado oil',
  'sesame oil',
  'vegetable oil',
  'canola oil',
  'sunflower oil',
  'grapeseed oil',
  'walnut oil',
  'truffle oil',
  'ghee',
  'lard',
  'duck fat',
  'bacon fat',
  
  // Acids & Vinegars
  'lemon',
  'lime',
  'orange',
  'grapefruit',
  'white wine vinegar',
  'red wine vinegar',
  'balsamic vinegar',
  'apple cider vinegar',
  'rice vinegar',
  'sherry vinegar',
  'champagne vinegar',
  'malt vinegar',
  'tamarind',
  'verjuice',
  
  // Sweeteners
  'sugar',
  'brown sugar',
  'honey',
  'maple syrup',
  'agave',
  'molasses',
  'coconut sugar',
  'date syrup',
  'stevia',
  'erythritol',
  'xylitol',
  'monk fruit',
  
  // Condiments & Sauces
  'soy sauce',
  'fish sauce',
  'Worcestershire sauce',
  'hot sauce',
  'Sriracha',
  'harissa',
  'chimichurri',
  'pesto',
  'tahini',
  'miso',
  'hoisin sauce',
  'oyster sauce',
  'teriyaki sauce',
  'barbecue sauce',
  'ketchup',
  'mustard',
  'Dijon mustard',
  'whole grain mustard',
  'mayonnaise',
  'aioli',
  'hollandaise',
  'béarnaise',
  'chimichurri',
  'salsa verde',
  'tapenade',
  'chutney',
  'relish',
  'pickles',
  'capers',
  'olives',
  'anchovies',
  'sun-dried tomatoes',
  'roasted red peppers',
  
  // Specialty & Gourmet
  'truffle',
  'caviar',
  'foie gras',
  'uni',
  'Wagyu beef',
  'Iberico ham',
  'prosciutto',
  'pancetta',
  'guanciale',
  'bresaola',
  'chorizo',
  'merguez',
  'andouille',
  'boudin',
  'confit',
  'rillettes',
  'pâté',
  'terrine',
  'charcuterie',
  'artisanal cheese',
  'aged cheese',
  'raw milk cheese',
  'specialty vinegars',
  'infused oils',
  'exotic spices',
  'heirloom varieties',
  'microgreens',
  'edible flowers',
  'molecular ingredients',
  'liquid nitrogen',
  'agar',
  'xanthan gum',
  'lecithin'
] as const;

// Enhanced disliked foods array - comprehensive list from food research, dietary surveys, and public datasets
export const COMMON_DISLIKED_FOODS = [
  // Commonly disliked vegetables (based on food preference studies)
  'mushrooms',
  'onions',
  'Brussels sprouts',
  'broccoli',
  'cauliflower',
  'cabbage',
  'kale',
  'spinach',
  'eggplant',
  'okra',
  'beets',
  'turnips',
  'radishes',
  'asparagus',
  'artichokes',
  'fennel',
  'leeks',
  'chard',
  'collard greens',
  'bitter greens',
  'arugula',
  'watercress',
  'endive',
  'radicchio',
  'dandelion greens',
  'mustard greens',
  'turnip greens',
  'beet greens',
  'kohlrabi',
  'rutabaga',
  'parsnips',
  'celery root',
  'jicama',
  'water chestnuts',
  'bamboo shoots',
  'bean sprouts',
  'alfalfa sprouts',
  'sprouts',
  'lima beans',
  'black-eyed peas',
  'kidney beans',
  'chickpeas',
  'lentils',
  'split peas',
  'green peas',
  'snow peas',
  'sugar snap peas',
  'green beans',
  'wax beans',
  'fava beans',
  'edamame',
  'soybeans',
  
  // Commonly disliked herbs & aromatics
  'cilantro',
  'parsley',
  'dill',
  'tarragon',
  'mint',
  'basil',
  'oregano',
  'thyme',
  'rosemary',
  'sage',
  'ginger',
  'garlic',
  'shallots',
  'scallions',
  'green onions',
  'chives',
  'leeks',
  'chili peppers',
  'jalapeños',
  'serrano peppers',
  'habaneros',
  'ghost peppers',
  'Carolina reapers',
  'scotch bonnets',
  'Thai chilies',
  'Poblano peppers',
  'chipotle',
  'cayenne',
  'paprika',
  'black pepper',
  'white pepper',
  'pink peppercorns',
  'spicy food',
  'hot sauce',
  'Sriracha',
  'Tabasco',
  'harissa',
  'sambal oelek',
  'gochujang',
  'wasabi',
  'horseradish',
  'mustard seed',
  'coriander',
  'cumin',
  'caraway seeds',
  'fennel seeds',
  'anise',
  'star anise',
  'cardamom',
  'cloves',
  'nutmeg',
  'mace',
  'allspice',
  'juniper berries',
  'bay leaves',
  'curry leaves',
  'lemongrass',
  'galangal',
  'turmeric',
  'saffron',
  'sumac',
  'za\'atar',
  'ras el hanout',
  'garam masala',
  'Chinese five spice',
  'berbere',
  'dukkah',
  'baharat',
  
  // Commonly disliked proteins (from dietary surveys)
  'liver',
  'kidney',
  'heart',
  'tongue',
  'brain',
  'sweetbreads',
  'organ meats',
  'tripe',
  'intestines',
  'blood sausage',
  'black pudding',
  'haggis',
  'head cheese',
  'pâté',
  'liverwurst',
  'anchovies',
  'sardines',
  'mackerel',
  'herring',
  'smelt',
  'kippers',
  'pickled herring',
  'oysters',
  'mussels',
  'clams',
  'scallops',
  'abalone',
  'conch',
  'periwinkles',
  'sea snails',
  'octopus',
  'squid',
  'cuttlefish',
  'crab',
  'lobster',
  'crayfish',
  'langostino',
  'shrimp',
  'prawns',
  'shellfish',
  'crustaceans',
  'mollusks',
  'sea urchin',
  'uni',
  'sea cucumber',
  'jellyfish',
  'shark',
  'skate',
  'ray',
  'eel',
  'monkfish',
  'cod liver',
  'fish roe',
  'caviar',
  'ikura',
  'tobiko',
  'bottarga',
  'raw fish',
  'sushi',
  'sashimi',
  'ceviche',
  'poke',
  'tartare',
  'carpaccio',
  'rare meat',
  'blood',
  'bone marrow',
  'tofu',
  'tempeh',
  'seitan',
  'textured vegetable protein',
  'meat substitutes',
  'veggie burgers',
  'fake meat',
  'nutritional yeast',
  'eggs',
  'raw eggs',
  'runny eggs',
  'soft-boiled eggs',
  'poached eggs',
  'egg whites',
  'egg yolks',
  'mayonnaise',
  'aioli',
  'hollandaise',
  'Caesar dressing',
  'ranch dressing',
  
  // Commonly disliked dairy & alternatives
  'blue cheese',
  'roquefort',
  'stilton',
  'gorgonzola',
  'limburger',
  'camembert',
  'brie',
  'goat cheese',
  'Feta',
  'strong cheeses',
  'aged cheese',
  'stinky cheese',
  'unpasteurized cheese',
  'raw milk cheese',
  'cottage cheese',
  'ricotta',
  'mascarpone',
  'cream cheese',
  'sour cream',
  'crème fraîche',
  'yogurt',
  'Greek yogurt',
  'kefir',
  'buttermilk',
  'heavy cream',
  'half and half',
  'whole milk',
  '2% milk',
  'skim milk',
  'powdered milk',
  'condensed milk',
  'evaporated milk',
  'lactose',
  'whey',
  'casein',
  'ghee',
  'clarified butter',
  'cultured butter',
  'salted butter',
  'coconut milk',
  'coconut cream',
  'coconut oil',
  'coconut flakes',
  'shredded coconut',
  'coconut water',
  'almond milk',
  'soy milk',
  'oat milk',
  'rice milk',
  'hemp milk',
  'cashew milk',
  'pea milk',
  'plant-based milk',
  
  // Commonly disliked flavors, textures & foods (from preference research)
  'olives',
  'black olives',
  'green olives',
  'kalamata olives',
  'olive oil',
  'extra virgin olive oil',
  'pickles',
  'pickled vegetables',
  'pickled onions',
  'pickled beets',
  'pickled eggs',
  'capers',
  'cornichons',
  'gherkins',
  'sauerkraut',
  'kimchi',
  'fermented vegetables',
  'fermented foods',
  'kombucha',
  'miso',
  'tempeh',
  'natto',
  'fish sauce',
  'shrimp paste',
  'anchojy paste',
  'Worcestershire sauce',
  'vinegar',
  'white vinegar',
  'apple cider vinegar',
  'balsamic vinegar',
  'red wine vinegar',
  'rice vinegar',
  'malt vinegar',
  'bitter foods',
  'bitter melon',
  'bitter gourd',
  'endive',
  'chicory',
  'dandelion',
  'artichoke hearts',
  'sour foods',
  'sour cream',
  'sour candy',
  'warheads',
  'lemon',
  'lime',
  'grapefruit',
  'cranberries',
  'tart cherries',
  'rhubarb',
  'tamarind',
  'sumac',
  'verjuice',
  'spicy foods',
  'very sweet foods',
  'overly sweet desserts',
  'artificial sweeteners',
  'aspartame',
  'sucralose',
  'saccharin',
  'stevia',
  'monk fruit',
  'xylitol',
  'erythritol',
  'sugar alcohols',
  'high fructose corn syrup',
  'corn syrup',
  'agave',
  'honey',
  'maple syrup',
  'molasses',
  'coconut',
  'coconut flavor',
  'avocado',
  'avocado toast',
  'guacamole',
  'nuts',
  'peanuts',
  'tree nuts',
  'almonds',
  'walnuts',
  'pecans',
  'hazelnuts',
  'cashews',
  'pistachios',
  'macadamia nuts',
  'Brazil nuts',
  'pine nuts',
  'chestnuts',
  'nut butters',
  'peanut butter',
  'almond butter',
  'tahini',
  'sunflower seed butter',
  'seeds',
  'sunflower seeds',
  'pumpkin seeds',
  'sesame seeds',
  'chia seeds',
  'flax seeds',
  'hemp seeds',
  'poppy seeds',
  'caraway seeds',
  'raisins',
  'dried fruit',
  'dried cranberries',
  'dried apricots',
  'dates',
  'figs',
  'prunes',
  'dried plums',
  'fruit leather',
  'candied fruit',
  'glacé fruit',
  'crystallized ginger',
  
  // Commonly disliked grains & starches
  'quinoa',
  'bulgur',
  'couscous',
  'barley',
  'pearl barley',
  'hulled barley',
  'oats',
  'steel cut oats',
  'rolled oats',
  'oatmeal',
  'buckwheat',
  'millet',
  'amaranth',
  'teff',
  'sorghum',
  'farro',
  'spelt',
  'kamut',
  'freekeh',
  'brown rice',
  'wild rice',
  'black rice',
  'red rice',
  'forbidden rice',
  'whole wheat',
  'whole grain bread',
  'multigrain bread',
  'seeded bread',
  'rye',
  'rye bread',
  'pumpernickel',
  'sourdough',
  'sprouted grain bread',
  'Ezekiel bread',
  'gluten-free bread',
  'rice cakes',
  'corn cakes',
  'crackers',
  'whole grain crackers',
  'seed crackers',
  'polenta',
  'grits',
  'cornmeal',
  'hominy',
  'masa',
  'tapioca',
  'cassava',
  'yuca',
  'plantains',
  'green bananas',
  'breadfruit',
  'taro',
  'yams',
  'sweet potatoes',
  'purple potatoes',
  'fingerling potatoes',
  
  // Commonly disliked condiments, sauces & dressings
  'mustard',
  'yellow mustard',
  'Dijon mustard',
  'whole grain mustard',
  'honey mustard',
  'brown mustard',
  'spicy mustard',
  'horseradish',
  'prepared horseradish',
  'wasabi',
  'soy sauce',
  'tamari',
  'liquid amino',
  'fish sauce',
  'oyster sauce',
  'hoisin sauce',
  'teriyaki sauce',
  'Worcestershire sauce',
  'A1 sauce',
  'HP sauce',
  'balsamic glaze',
  'tahini',
  'sesame paste',
  'miso paste',
  'gochujang',
  'doubanjiang',
  'black bean sauce',
  'XO sauce',
  'ketchup',
  'banana ketchup',
  'mushroom ketchup',
  'relish',
  'sweet relish',
  'dill relish',
  'pickle relish',
  'chutney',
  'mango chutney',
  'apple chutney',
  'cranberry sauce',
  'applesauce',
  'salsa',
  'salsa verde',
  'tomatillo salsa',
  'pico de gallo',
  'hot salsa',
  'mild salsa',
  'pesto',
  'basil pesto',
  'sun-dried tomato pesto',
  'arugula pesto',
  'tapenade',
  'olive tapenade',
  'sun-dried tomato tapenade',
  'hummus',
  'baba ganoush',
  'tzatziki',
  'chimichurri',
  'salsa verde',
  'gremolata',
  'aioli',
  'garlic aioli',
  'chipotle aioli',
  'hollandaise',
  'béarnaise',
  'beurre blanc',
  'velouté',
  'espagnole',
  'demi-glace',
  'gravy',
  'brown gravy',
  'sausage gravy',
  'cream gravy',
  'pan gravy',
  'giblet gravy',
  
  // Commonly disliked specialty & exotic items (from global food surveys)
  'truffle',
  'black truffle',
  'white truffle',
  'truffle oil',
  'caviar',
  'beluga caviar',
  'ossetra caviar',
  'sevruga caviar',
  'foie gras',
  'duck liver',
  'goose liver',
  'uni',
  'sea urchin',
  'bone marrow',
  'escargot',
  'snails',
  'frog legs',
  'alligator',
  'crocodile',
  'exotic meats',
  'game meat',
  'wild game',
  'venison',
  'elk',
  'moose',
  'caribou',
  'bison',
  'buffalo',
  'wild boar',
  'rabbit',
  'hare',
  'squirrel',
  'opossum',
  'raccoon',
  'bear',
  'duck',
  'goose',
  'quail',
  'pheasant',
  'partridge',
  'guinea fowl',
  'ostrich',
  'emu',
  'kangaroo',
  'lamb',
  'mutton',
  'goat',
  'kid goat',
  'veal',
  'baby beef',
  'pork',
  'ham',
  'bacon',
  'pancetta',
  'prosciutto',
  'serrano ham',
  'jamón ibérico',
  'country ham',
  'Virginia ham',
  'black forest ham',
  'sausage',
  'baltwurst',
  'kielbasa',
  'chorizo',
  'andouille',
  'boudin',
  'merguez',
  'weisswurst',
  'knockwurst',
  'liverwurst',
  'salami',
  'pepperoni',
  'sopressata',
  'mortadella',
  'capicola',
  'bresaola',
  'guanciale',
  'charcuterie',
  'cured meats',
  'processed meats',
  'deli meat',
  'lunch meat',
  'cold cuts',
  'sandwich meat',
  'canned meat',
  'potted meat',
  'spam',
  'Vienna sausages',
  'hot dogs',
  'frankfurters',
  'baltwurst',
  'Polish sausage',
  'Italian sausage',
  'breakfast sausage',
  'sausage links',
  'sausage patties',
  'chicken sausage',
  'turkey sausage',
  'vegetarian sausage',
  'insects',
  'crickets',
  'grasshoppers',
  'mealworms',
  'ants',
  'larvae',
  'grubs',
  'witchetty grubs',
  'silkworm pupae',
  'century eggs',
  'thousand-year eggs',
  'balut',
  'duck embryo',
  'rocky mountain oysters',
  'prairie oysters',
  'calf testicles',
  'bull testicles',
  'sheep testicles',
  'pig testicles',
  'chicken feet',
  'duck feet',
  'pig feet',
  'cow feet',
  'trotters',
  'pig ears',
  'cow ears',
  'pig tail',
  'cow tail',
  'oxtail',
  'pig snout',
  'cow nose',
  'chicken gizzards',
  'chicken hearts',
  'chicken livers',
  'duck hearts',
  'duck gizzards',
  'turkey giblets',
  'neck bones',
  'marrow bones',
  'soup bones',
  'dog meat',
  'cat meat',
  'horse meat',
  'whale meat',
  'seal meat',
  'turtle meat',
  'snake meat',
  'iguana',
  'lizard',
  'rat',
  'mouse',
  'guinea pig',
  'cuy',
  'monkey',
  'bushmeat',
  'roadkill',
  'spoiled food',
  'rotten food',
  'moldy food',
  'expired food',
  'fermented shark',
  'hákarl',
  'surströmming',
  'fermented fish',
  'stinky tofu',
  'durian',
  'jackfruit',
  'noni fruit',
  'ackee',
  'breadfruit',
  'soursop',
  'custard apple',
  'dragon fruit',
  'rambutan',
  'lychee',
  'longan',
  'mangosteen',
  'passion fruit',
  'guava',
  'papaya',
  'star fruit',
  'persimmon',
  'pomegranate',
  'quince',
  'medlar',
  'elderberries',
  'gooseberries',
  'currants',
  'huckleberries',
  'cloudberries',
  'sea buckthorn',
  'goji berries',
  'acai berries',
  'camu camu',
  'miracle fruit'
] as const;

// Nutritional goals options - Enhanced with 2024-2025 health trends and research
export const NUTRITIONAL_GOALS = [
  // Core Goals (existing)
  'WEIGHT_LOSS',
  'MUSCLE_GAIN', 
  'MAINTENANCE',
  
  // Health Conditions (existing + enhanced)
  'HEART_HEALTHY',
  'DIABETIC_FRIENDLY',
  'LOW_SODIUM',
  'HIGH_PROTEIN',
  'LOW_CARB',
  'HIGH_FIBER',
  
  // Popular 2024-2025 Health Trends
  'ANTI_INFLAMMATORY',
  'GUT_HEALTH',
  'HORMONE_BALANCE',
  'ENERGY_BOOST',
  'IMMUNE_SUPPORT',
  'BRAIN_HEALTH',
  'LONGEVITY',
  'METABOLISM_BOOST',
  'STRESS_REDUCTION',
  'SLEEP_IMPROVEMENT',
  
  // Specific Dietary Approaches
  'INTERMITTENT_FASTING',
  'PLANT_BASED',
  'MEDITERRANEAN',
  'KETO_FRIENDLY',
  'PALEO_FRIENDLY',
  'WHOLE30_COMPATIBLE',
  
  // Performance & Lifestyle
  'ATHLETIC_PERFORMANCE',
  'POST_WORKOUT_RECOVERY',
  'PRENATAL_NUTRITION',
  'HEALTHY_AGING',
  'DETOX_SUPPORT',
  'BONE_HEALTH',
  'SKIN_HEALTH',
  'DIGESTIVE_HEALTH'
] as const;

// Budget preference options
export const BUDGET_PREFERENCES = [
  'BUDGET',
  'MODERATE',
  'PREMIUM',
  'LUXURY'
] as const;

// Meal type options - Enhanced with specific categories and popular meal types
export const MEAL_TYPES = [
  // Traditional Meals
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'BRUNCH',
  
  // Snacks & Light Meals
  'SNACKS',
  'APPETIZERS',
  'LATE_NIGHT',
  'QUICK_BITES',
  'FINGER_FOODS',
  
  // Desserts & Sweets
  'DESSERTS',
  'BAKED_GOODS',
  'FROZEN_TREATS',
  'HOLIDAY_SWEETS',
  
  // Beverages
  'SMOOTHIES',
  'COCKTAILS',
  'HOT_BEVERAGES',
  'FRESH_JUICES',
  
  // Meal Prep & Planning
  'MEAL_PREP',
  'BATCH_COOKING',
  'FREEZER_MEALS',
  'LUNCHBOX_MEALS',
  
  // Special Occasions
  'PARTY_FOOD',
  'HOLIDAY_MEALS',
  'CELEBRATION_CAKES',
  'PICNIC_FOOD',
  'BBQ_GRILLING',
  
  // Health & Wellness
  'POST_WORKOUT',
  'DETOX_MEALS',
  'COMFORT_FOOD',
  'ENERGY_BOOSTERS',
  
  // International & Fusion
  'STREET_FOOD',
  'TAPAS_SMALL_PLATES',
  'FAMILY_STYLE',
  'BUFFET_STYLE',
  
  // Dietary Specific
  'KETO_MEALS',
  'VEGAN_MEALS',
  'GLUTEN_FREE',
  'LOW_CARB',
  'HIGH_PROTEIN',
  
  // Cooking Methods
  'ONE_POT_MEALS',
  'NO_COOK_MEALS',
  'SLOW_COOKER',
  'AIR_FRYER',
  'GRILLED_MEALS'
] as const;

// Popular meal type suggestions - Top choices for quick selection
export const POPULAR_MEAL_TYPES = [
  // Most Common
  'BREAKFAST',
  'LUNCH', 
  'DINNER',
  'SNACKS',
  'DESSERTS',
  
  // Trending
  'MEAL_PREP',
  'ONE_POT_MEALS',
  'QUICK_BITES',
  'SMOOTHIES',
  'COMFORT_FOOD',
  
  // Lifestyle
  'POST_WORKOUT',
  'BRUNCH',
  'APPETIZERS',
  'PARTY_FOOD',
  'BBQ_GRILLING'
] as const;

// Cooking equipment options - Enhanced with 2024-2025 kitchen trends and professional recommendations
export const COOKING_EQUIPMENT = [
  // Basic Equipment (existing)
  'OVEN',
  'STOVETOP',
  'MICROWAVE',
  
  // Grilling & Outdoor (existing + enhanced)
  'GRILL',
  'OUTDOOR_SMOKER',
  'PIZZA_OVEN',
  'FIRE_PIT',
  
  // Modern Appliances (existing + enhanced)
  'AIR_FRYER',
  'CONVECTION_OVEN',
  'TOASTER_OVEN',
  'COUNTERTOP_CONVECTION',
  
  // Slow & Pressure Cooking (existing + enhanced)
  'SLOW_COOKER',
  'PRESSURE_COOKER',
  'INSTANT_POT',
  'DUTCH_OVEN',
  'TAGINE',
  
  // Food Processing (existing + enhanced)
  'BLENDER',
  'HIGH_SPEED_BLENDER',
  'IMMERSION_BLENDER',
  'FOOD_PROCESSOR',
  'STAND_MIXER',
  'HAND_MIXER',
  'MORTAR_PESTLE',
  
  // Specialized Cooking (existing + enhanced)
  'RICE_COOKER',
  'STEAMER',
  'BAMBOO_STEAMER',
  'ELECTRIC_STEAMER',
  'DEEP_FRYER',
  'SOUS_VIDE',
  'DEHYDRATOR',
  'FERMENTATION_CROCK',
  
  // Professional & Specialty Tools
  'MANDOLINE_SLICER',
  'SPIRALIZER',
  'JUICER',
  'ESPRESSO_MACHINE',
  'BREAD_MAKER',
  'PASTA_MACHINE',
  'ICE_CREAM_MAKER',
  'YOGURT_MAKER',
  'WAFFLE_MAKER',
  'PANCAKE_GRIDDLE',
  'CREPE_MAKER',
  'FONDUE_POT',
  
  // Grilling & Specialty
  'INDOOR_GRILL',
  'PANINI_PRESS',
  'SANDWICH_MAKER',
  'ELECTRIC_WOK',
  'INDUCTION_COOKTOP',
  'PORTABLE_BURNER',
  
  // Baking & Pastry
  'KITCHEN_SCALE',
  'DOUGH_MIXER',
  'PROOFING_BASKET',
  'BAKING_STONE',
  'SHEET_PAN',
  'CAST_IRON_SKILLET',
  'CARBON_STEEL_PAN',
  'COPPER_COOKWARE',
  
  // Modern Tech
  'SMART_THERMOMETER',
  'VACUUM_SEALER',
  'SMOKING_GUN',
  'CULINARY_TORCH',
  'NITROUS_OXIDE_WHIPPER',
  
  // Essential Tools
  'CHEF_KNIFE',
  'CUTTING_BOARD',
  'MIXING_BOWLS',
  'MEASURING_CUPS',
  'KITCHEN_THERMOMETER'
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

/**
 * Recipe generation validation schema
 */
export const recipeGenerationSchema = z.object({
  inspiration: z
    .string()
    .min(1, 'Inspiration cannot be empty')
    .max(200, 'Inspiration must be less than 200 characters')
    .optional(),
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .max(50, 'Too many ingredients')
    .optional(),
  cookingTime: z
    .number()
    .int('Cooking time must be an integer')
    .min(5, 'Cooking time must be at least 5 minutes')
    .max(480, 'Cooking time cannot exceed 8 hours')
    .optional(),
  servings: z
    .number()
    .int('Servings must be an integer')
    .min(1, 'Servings must be at least 1')
    .max(20, 'Servings cannot exceed 20')
    .optional(),
  difficulty: z
    .enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'])
    .optional(),
  mealType: z
    .string()
    .min(1, 'Meal type cannot be empty')
    .max(50, 'Meal type must be less than 50 characters')
    .optional(),
  additionalRequests: z
    .string()
    .max(500, 'Additional requests must be less than 500 characters')
    .optional(),
});

/**
 * Recipe rating validation schema
 */
export const recipeRatingSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

// Type exports for recipe validation
export type RecipeGenerationInput = z.infer<typeof recipeGenerationSchema>;
export type RecipeRatingInput = z.infer<typeof recipeRatingSchema>;

/**
 * Validate recipe generation request
 */
export function validateRecipeGeneration(data: any): { success: boolean; errors?: string[] } {
  try {
    recipeGenerationSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Invalid data format'] };
  }
}

/**
 * Validate recipe rating request
 */
export function validateRecipeRating(data: any): { success: boolean; errors?: string[] } {
  try {
    recipeRatingSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Invalid data format'] };
  }
}

/**
 * Password update validation schema
 */
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>; 