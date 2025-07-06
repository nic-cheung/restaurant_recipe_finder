import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    dinnerTimePreference: z.ZodOptional<z.ZodString>;
    spiceTolerance: z.ZodOptional<z.ZodEnum<["MILD", "MEDIUM", "HOT", "EXTREME"]>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    name: string;
    location?: string | undefined;
    timezone?: string | undefined;
    dinnerTimePreference?: string | undefined;
    spiceTolerance?: "MILD" | "MEDIUM" | "HOT" | "EXTREME" | undefined;
}, {
    password: string;
    email: string;
    name: string;
    location?: string | undefined;
    timezone?: string | undefined;
    dinnerTimePreference?: string | undefined;
    spiceTolerance?: "MILD" | "MEDIUM" | "HOT" | "EXTREME" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const userPreferencesSchema: z.ZodObject<{
    dietaryRestrictions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    allergies: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    favoriteIngredients: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    dislikedFoods: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    favoriteCuisines: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    favoriteDishes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    favoriteChefs: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    favoriteRestaurants: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    cookingSkillLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]>>>;
    preferredCookingTime: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    servingSize: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    nutritionalGoals: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "HEART_HEALTHY", "DIABETIC_FRIENDLY", "LOW_SODIUM", "HIGH_PROTEIN", "LOW_CARB", "HIGH_FIBER"]>, "many">>>;
    budgetPreference: z.ZodDefault<z.ZodOptional<z.ZodEnum<["BUDGET", "MODERATE", "PREMIUM", "LUXURY"]>>>;
    preferredMealTypes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "DESSERTS", "APPETIZERS", "BRUNCH", "LATE_NIGHT"]>, "many">>>;
    availableEquipment: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["OVEN", "STOVETOP", "MICROWAVE", "GRILL", "AIR_FRYER", "SLOW_COOKER", "PRESSURE_COOKER", "BLENDER", "FOOD_PROCESSOR", "STAND_MIXER", "TOASTER_OVEN", "RICE_COOKER", "STEAMER", "DEEP_FRYER", "SOUS_VIDE"]>, "many">>>;
    mealComplexity: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ONE_POT", "SIMPLE", "MODERATE", "COMPLEX", "GOURMET"]>>>;
}, "strip", z.ZodTypeAny, {
    dietaryRestrictions: string[];
    allergies: string[];
    favoriteIngredients: string[];
    dislikedFoods: string[];
    favoriteCuisines: string[];
    favoriteDishes: string[];
    favoriteChefs: string[];
    favoriteRestaurants: string[];
    cookingSkillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    servingSize: number | null;
    nutritionalGoals: ("WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "HEART_HEALTHY" | "DIABETIC_FRIENDLY" | "LOW_SODIUM" | "HIGH_PROTEIN" | "LOW_CARB" | "HIGH_FIBER")[];
    budgetPreference: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY";
    preferredMealTypes: ("BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS" | "DESSERTS" | "APPETIZERS" | "BRUNCH" | "LATE_NIGHT")[];
    availableEquipment: ("OVEN" | "STOVETOP" | "MICROWAVE" | "GRILL" | "AIR_FRYER" | "SLOW_COOKER" | "PRESSURE_COOKER" | "BLENDER" | "FOOD_PROCESSOR" | "STAND_MIXER" | "TOASTER_OVEN" | "RICE_COOKER" | "STEAMER" | "DEEP_FRYER" | "SOUS_VIDE")[];
    mealComplexity: "MODERATE" | "ONE_POT" | "SIMPLE" | "COMPLEX" | "GOURMET";
    preferredCookingTime?: number | null | undefined;
}, {
    dietaryRestrictions?: string[] | undefined;
    allergies?: string[] | undefined;
    favoriteIngredients?: string[] | undefined;
    dislikedFoods?: string[] | undefined;
    favoriteCuisines?: string[] | undefined;
    favoriteDishes?: string[] | undefined;
    favoriteChefs?: string[] | undefined;
    favoriteRestaurants?: string[] | undefined;
    cookingSkillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | undefined;
    preferredCookingTime?: number | null | undefined;
    servingSize?: number | null | undefined;
    nutritionalGoals?: ("WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "HEART_HEALTHY" | "DIABETIC_FRIENDLY" | "LOW_SODIUM" | "HIGH_PROTEIN" | "LOW_CARB" | "HIGH_FIBER")[] | undefined;
    budgetPreference?: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY" | undefined;
    preferredMealTypes?: ("BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS" | "DESSERTS" | "APPETIZERS" | "BRUNCH" | "LATE_NIGHT")[] | undefined;
    availableEquipment?: ("OVEN" | "STOVETOP" | "MICROWAVE" | "GRILL" | "AIR_FRYER" | "SLOW_COOKER" | "PRESSURE_COOKER" | "BLENDER" | "FOOD_PROCESSOR" | "STAND_MIXER" | "TOASTER_OVEN" | "RICE_COOKER" | "STEAMER" | "DEEP_FRYER" | "SOUS_VIDE")[] | undefined;
    mealComplexity?: "MODERATE" | "ONE_POT" | "SIMPLE" | "COMPLEX" | "GOURMET" | undefined;
}>;
export declare const updateUserPreferencesSchema: z.ZodObject<{
    dietaryRestrictions: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    allergies: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    favoriteIngredients: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    dislikedFoods: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    favoriteCuisines: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    favoriteDishes: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    favoriteChefs: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    favoriteRestaurants: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    cookingSkillLevel: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]>>>>;
    preferredCookingTime: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    servingSize: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>>;
    nutritionalGoals: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "HEART_HEALTHY", "DIABETIC_FRIENDLY", "LOW_SODIUM", "HIGH_PROTEIN", "LOW_CARB", "HIGH_FIBER"]>, "many">>>>;
    budgetPreference: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["BUDGET", "MODERATE", "PREMIUM", "LUXURY"]>>>>;
    preferredMealTypes: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "DESSERTS", "APPETIZERS", "BRUNCH", "LATE_NIGHT"]>, "many">>>>;
    availableEquipment: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["OVEN", "STOVETOP", "MICROWAVE", "GRILL", "AIR_FRYER", "SLOW_COOKER", "PRESSURE_COOKER", "BLENDER", "FOOD_PROCESSOR", "STAND_MIXER", "TOASTER_OVEN", "RICE_COOKER", "STEAMER", "DEEP_FRYER", "SOUS_VIDE"]>, "many">>>>;
    mealComplexity: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["ONE_POT", "SIMPLE", "MODERATE", "COMPLEX", "GOURMET"]>>>>;
}, "strip", z.ZodTypeAny, {
    dietaryRestrictions?: string[] | undefined;
    allergies?: string[] | undefined;
    favoriteIngredients?: string[] | undefined;
    dislikedFoods?: string[] | undefined;
    favoriteCuisines?: string[] | undefined;
    favoriteDishes?: string[] | undefined;
    favoriteChefs?: string[] | undefined;
    favoriteRestaurants?: string[] | undefined;
    cookingSkillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | undefined;
    preferredCookingTime?: number | null | undefined;
    servingSize?: number | null | undefined;
    nutritionalGoals?: ("WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "HEART_HEALTHY" | "DIABETIC_FRIENDLY" | "LOW_SODIUM" | "HIGH_PROTEIN" | "LOW_CARB" | "HIGH_FIBER")[] | undefined;
    budgetPreference?: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY" | undefined;
    preferredMealTypes?: ("BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS" | "DESSERTS" | "APPETIZERS" | "BRUNCH" | "LATE_NIGHT")[] | undefined;
    availableEquipment?: ("OVEN" | "STOVETOP" | "MICROWAVE" | "GRILL" | "AIR_FRYER" | "SLOW_COOKER" | "PRESSURE_COOKER" | "BLENDER" | "FOOD_PROCESSOR" | "STAND_MIXER" | "TOASTER_OVEN" | "RICE_COOKER" | "STEAMER" | "DEEP_FRYER" | "SOUS_VIDE")[] | undefined;
    mealComplexity?: "MODERATE" | "ONE_POT" | "SIMPLE" | "COMPLEX" | "GOURMET" | undefined;
}, {
    dietaryRestrictions?: string[] | undefined;
    allergies?: string[] | undefined;
    favoriteIngredients?: string[] | undefined;
    dislikedFoods?: string[] | undefined;
    favoriteCuisines?: string[] | undefined;
    favoriteDishes?: string[] | undefined;
    favoriteChefs?: string[] | undefined;
    favoriteRestaurants?: string[] | undefined;
    cookingSkillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | undefined;
    preferredCookingTime?: number | null | undefined;
    servingSize?: number | null | undefined;
    nutritionalGoals?: ("WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "HEART_HEALTHY" | "DIABETIC_FRIENDLY" | "LOW_SODIUM" | "HIGH_PROTEIN" | "LOW_CARB" | "HIGH_FIBER")[] | undefined;
    budgetPreference?: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY" | undefined;
    preferredMealTypes?: ("BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS" | "DESSERTS" | "APPETIZERS" | "BRUNCH" | "LATE_NIGHT")[] | undefined;
    availableEquipment?: ("OVEN" | "STOVETOP" | "MICROWAVE" | "GRILL" | "AIR_FRYER" | "SLOW_COOKER" | "PRESSURE_COOKER" | "BLENDER" | "FOOD_PROCESSOR" | "STAND_MIXER" | "TOASTER_OVEN" | "RICE_COOKER" | "STEAMER" | "DEEP_FRYER" | "SOUS_VIDE")[] | undefined;
    mealComplexity?: "MODERATE" | "ONE_POT" | "SIMPLE" | "COMPLEX" | "GOURMET" | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
export declare const COMMON_DIETARY_RESTRICTIONS: readonly ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Low-Fat", "Low-Sodium", "Diabetic-Friendly", "Heart-Healthy", "Mediterranean", "Whole30", "Pescatarian", "Kosher", "Halal"];
export declare const COMMON_ALLERGIES: readonly ["Peanuts", "Tree Nuts", "Milk", "Eggs", "Fish", "Shellfish", "Soy", "Wheat", "Sesame", "Mustard", "Celery", "Lupin", "Mollusks", "Sulfites"];
export declare const COMMON_CUISINES: readonly ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Greek", "Mediterranean", "American", "Korean", "Vietnamese", "Spanish", "Turkish", "Lebanese", "Moroccan", "Ethiopian", "Brazilian", "Peruvian", "British", "German", "Russian", "Caribbean", "Middle Eastern", "African"];
export declare const COMMON_CHEFS: readonly ["Joël Robuchon", "Alain Ducasse", "Thomas Keller", "Ferran Adrià", "René Redzepi", "Massimo Bottura", "Grant Achatz", "Heston Blumenthal", "Daniel Boulud", "Eric Ripert", "Jean-Georges Vongerichten", "Marco Pierre White", "Gordon Ramsay", "Alain Passard", "Pierre Gagnaire", "Jiro Yamamoto", "Yoshihiro Narisawa", "Hiroyuki Kanda", "Seiji Yamamoto", "Takagi Kazuo", "Hideki Ishikawa", "Nobu Matsuhisa", "Masaharu Morimoto", "David Chang", "Yotam Ottolenghi", "José Andrés", "Alice Waters", "Dan Barber", "Magnus Nilsson", "Alex Atala", "Virgilio Martínez", "Gastón Acurio", "Enrique Olvera", "Pim Techamuanvivit", "Dominique Crenn", "Alison Roman", "Gaggan Anand", "Mauro Colagreco", "Niki Nakayama", "Daniela Soto-Innes", "Asma Khan", "Manish Mehrotra", "Vineet Bhatia", "Hemant Oberoi", "Andre Chiang", "Tetsuya Wakuda", "Peter Gilmore", "Josh Niland", "Heinz Beck", "Niko Romito", "Andoni Luis Aduriz", "Joan Roca", "Quique Dacosta", "Paco Roncero", "Emmanuel Renaut", "Yannick Alléno", "Anne-Sophie Pic", "Clare Smyth", "Jason Atherton", "Marcus Wareing"];
export declare const COMMON_RESTAURANTS: readonly ["Noma", "The French Laundry", "Le Bernardin", "Eleven Madison Park", "Osteria Francescana", "Mirazur", "Asador Etxebarri", "Central", "Disfrutar", "Frantzén", "Maido", "Odette", "The Chairman", "Pujol", "Steirereck", "Don Julio", "Mugaritz", "Cosme", "Lyle's", "Septime", "Per Se", "Alinea", "Masa", "Daniel", "Jean-Georges", "Le Bernardin", "Chez Panisse", "Spago", "Momofuku Ko", "Atelier Crenn", "Benu", "Manresa", "The Restaurant at Meadowood", "Saison", "SingleThread", "Sukiyabashi Jiro", "Narisawa", "Ishikawa", "Kikunoi", "Ryugin", "Nihonryori RyuGin", "Sushi Saito", "Sushi Yoshitake", "Tempura Kondo", "Florilège", "L'Effervescence", "Quintessence", "L'Ambroisie", "Guy Savoy", "L'Astrance", "Alain Ducasse au Plaza Athénée", "Pierre Gagnaire", "Le Meurice", "Epicure", "Le Bristol", "Geranium", "Alchemist", "Jordnær", "Hof van Cleve", "The Jane", "Oud Sluis", "De Librije", "Mountain", "The Ledbury", "Core by Clare Smyth", "Sketch", "Dinner by Heston Blumenthal", "Pollen Street Social", "Restaurant Gordon Ramsay", "Alain Ducasse at The Dorchester", "Fera at Claridge's", "Ikoyi", "Kitchen Table", "Da Terra", "The Clove Club", "Kol", "Brat", "St. John", "Barrafina", "Dishoom", "Hawksmoor", "Rules", "Simpson's in the Strand", "El Celler de Can Roca", "Azurmendi", "Arzak", "Quique Dacosta", "ABaC", "Coque", "Nerua", "Etxanobe", "Osteria Francescana", "Le Calandre", "Dal Pescatore", "La Pergola", "Piazza Duomo", "Reale", "Villa Crespi", "Il Luogo di Aimo e Nadia", "Gaggan", "Indian Accent", "Trishna", "Burnt Ends", "Jaan", "Restaurant André", "Waku Ghin", "Cut by Wolfgang Puck", "Amber", "Bo Innovation", "Lung King Heen", "T'ang Court", "Pujol", "Quintonil", "Sud 777", "Rosetta", "Central", "Maido", "Astrid y Gastón", "Rafael", "Boragó", "Leo", "Tegui", "Parador La Huella", "L'Ami Jean", "Bistrot Paul Bert", "Le Comptoir du Relais", "Frenchie", "Le Chateaubriand", "Clamato", "Breizh Café", "Du Pain et des Idées", "Pierre Hermé", "Cedric Grolet", "Auberge du Soleil", "Bouchon Bistro", "Ad Hoc", "Oxbow Public Market", "Farmstead at Long Meadow Ranch", "Bottega", "Cyrus", "Madrona Manor", "Commander's Palace", "Café du Monde", "Mother's", "Cochon", "Herbsaint", "August", "Emeril's", "GW Fins", "Coop's Place", "Acme Oyster House"];
export declare const COMMON_DISHES: readonly ["Coq au Vin", "Beef Bourguignon", "Bouillabaisse", "Ratatouille", "Cassoulet", "Duck Confit", "Escargots", "Foie Gras", "Soufflé", "Crème Brûlée", "Tarte Tatin", "Quiche Lorraine", "French Onion Soup", "Pot-au-Feu", "Blanquette de Veau", "Risotto Milanese", "Osso Buco", "Carbonara", "Cacio e Pepe", "Amatriciana", "Bolognese", "Puttanesca", "Aglio e Olio", "Margherita Pizza", "Tiramisu", "Panna Cotta", "Gelato", "Bruschetta", "Caprese Salad", "Vitello Tonnato", "Sushi", "Sashimi", "Tempura", "Ramen", "Udon", "Soba", "Yakitori", "Teriyaki", "Miso Soup", "Chirashi", "Katsu", "Gyoza", "Takoyaki", "Okonomiyaki", "Mochi", "Peking Duck", "Kung Pao Chicken", "Sweet and Sour Pork", "Ma Po Tofu", "Dim Sum", "Xiaolongbao", "Fried Rice", "Chow Mein", "Hot Pot", "Wontons", "Spring Rolls", "General Tso's Chicken", "Orange Chicken", "Beef and Broccoli", "Egg Drop Soup", "Butter Chicken", "Tikka Masala", "Biryani", "Curry", "Tandoori Chicken", "Samosas", "Naan", "Dal", "Palak Paneer", "Vindaloo", "Korma", "Masala Dosa", "Chana Masala", "Lamb Rogan Josh", "Gulab Jamun", "Pad Thai", "Green Curry", "Red Curry", "Tom Yum Soup", "Tom Kha Gai", "Massaman Curry", "Pad See Ew", "Larb", "Som Tam", "Mango Sticky Rice", "Thai Basil Chicken", "Pad Kra Pao", "Satay", "Thai Fried Rice", "Papaya Salad", "Tacos", "Burritos", "Quesadillas", "Enchiladas", "Tamales", "Pozole", "Mole", "Chiles Rellenos", "Carnitas", "Carne Asada", "Guacamole", "Salsa", "Elote", "Churros", "Tres Leches Cake", "Hummus", "Falafel", "Tabbouleh", "Baba Ganoush", "Shawarma", "Kebabs", "Dolmas", "Tzatziki", "Moussaka", "Spanakopita", "Paella", "Gazpacho", "Baklava", "Greek Salad", "Souvlaki", "Hamburger", "Hot Dog", "Mac and Cheese", "Fried Chicken", "BBQ Ribs", "Clam Chowder", "Lobster Roll", "Cheesesteak", "Buffalo Wings", "Apple Pie", "Chocolate Chip Cookies", "Pancakes", "Waffles", "Eggs Benedict", "Caesar Salad", "Poke Bowl", "Ramen Burger", "Korean BBQ Tacos", "Sushi Pizza", "Truffle Mac and Cheese", "Deconstructed Dishes", "Molecular Gastronomy", "Foam Dishes", "Sous Vide Preparations", "Smoked Cocktails", "Liquid Nitrogen Desserts", "Edible Flowers", "Microgreens", "Artisanal Everything", "Plant-Based Meats", "Chicken Soup", "Grilled Cheese", "Meatloaf", "Shepherd's Pie", "Pot Roast", "Mashed Potatoes", "Biscuits and Gravy", "Chicken and Waffles", "Fish and Chips", "Bangers and Mash", "Cottage Pie", "Beef Stew", "Chicken Pot Pie", "Tuna Melt", "Grilled Salmon", "Eggs Benedict", "French Toast", "Pancakes", "Waffles", "Omelette", "Avocado Toast", "Shakshuka", "Huevos Rancheros", "Breakfast Burrito", "Bagel and Lox", "Croissant", "Danish Pastry", "Muffins", "Scones", "Granola", "Chocolate Soufflé", "Crème Brûlée", "Tiramisu", "Cheesecake", "Chocolate Cake", "Ice Cream", "Sorbet", "Macarons", "Profiteroles", "Tarte Tatin", "Bread Pudding", "Panna Cotta", "Flan", "Mousse", "Gelato"];
export declare const COMMON_INGREDIENTS: readonly ["Chicken", "Beef", "Pork", "Lamb", "Turkey", "Duck", "Salmon", "Tuna", "Cod", "Halibut", "Shrimp", "Lobster", "Crab", "Scallops", "Mussels", "Oysters", "Tofu", "Tempeh", "Seitan", "Eggs", "Onions", "Garlic", "Tomatoes", "Bell Peppers", "Carrots", "Celery", "Potatoes", "Sweet Potatoes", "Broccoli", "Cauliflower", "Spinach", "Kale", "Arugula", "Lettuce", "Mushrooms", "Zucchini", "Eggplant", "Asparagus", "Brussels Sprouts", "Cabbage", "Leeks", "Fennel", "Artichokes", "Avocados", "Cucumbers", "Radishes", "Beets", "Turnips", "Parsnips", "Corn", "Peas", "Green Beans", "Okra", "Chard", "Collard Greens", "Basil", "Oregano", "Thyme", "Rosemary", "Sage", "Parsley", "Cilantro", "Dill", "Chives", "Tarragon", "Mint", "Bay Leaves", "Marjoram", "Lemongrass", "Ginger", "Turmeric", "Galangal", "Shallots", "Scallions", "Chili Peppers", "Jalapeños", "Serrano Peppers", "Habaneros", "Chipotle", "Poblano", "Anaheim Peppers", "Salt", "Black Pepper", "White Pepper", "Paprika", "Cumin", "Coriander", "Cardamom", "Cinnamon", "Nutmeg", "Cloves", "Allspice", "Star Anise", "Fennel Seeds", "Mustard Seeds", "Sesame Seeds", "Poppy Seeds", "Caraway Seeds", "Turmeric", "Saffron", "Sumac", "Za'atar", "Garam Masala", "Curry Powder", "Chinese Five Spice", "Herbes de Provence", "Italian Seasoning", "Cajun Seasoning", "Chili Powder", "Smoked Paprika", "Cayenne Pepper", "Red Pepper Flakes", "Vanilla", "Cocoa Powder", "Rice", "Quinoa", "Bulgur", "Couscous", "Farro", "Barley", "Oats", "Wheat", "Rye", "Buckwheat", "Millet", "Amaranth", "Pasta", "Noodles", "Bread", "Flour", "Cornmeal", "Polenta", "Semolina", "Breadcrumbs", "Black Beans", "Kidney Beans", "Chickpeas", "Lentils", "Split Peas", "Navy Beans", "Pinto Beans", "Lima Beans", "Cannellini Beans", "Edamame", "Almonds", "Walnuts", "Pecans", "Hazelnuts", "Pistachios", "Cashews", "Macadamia Nuts", "Pine Nuts", "Peanuts", "Chestnuts", "Brazil Nuts", "Sunflower Seeds", "Pumpkin Seeds", "Chia Seeds", "Flax Seeds", "Hemp Seeds", "Butter", "Milk", "Cream", "Yogurt", "Cheese", "Mozzarella", "Parmesan", "Cheddar", "Goat Cheese", "Feta", "Ricotta", "Mascarpone", "Cream Cheese", "Sour Cream", "Crème Fraîche", "Coconut Milk", "Almond Milk", "Oat Milk", "Soy Milk", "Cashew Cream", "Nutritional Yeast", "Olive Oil", "Extra Virgin Olive Oil", "Coconut Oil", "Avocado Oil", "Sesame Oil", "Vegetable Oil", "Canola Oil", "Sunflower Oil", "Grapeseed Oil", "Walnut Oil", "Truffle Oil", "Ghee", "Lard", "Duck Fat", "Bacon Fat", "Lemon", "Lime", "Orange", "Grapefruit", "White Wine Vinegar", "Red Wine Vinegar", "Balsamic Vinegar", "Apple Cider Vinegar", "Rice Vinegar", "Sherry Vinegar", "Champagne Vinegar", "Malt Vinegar", "Tamarind", "Sumac", "Verjuice", "Sugar", "Brown Sugar", "Honey", "Maple Syrup", "Agave", "Molasses", "Coconut Sugar", "Date Syrup", "Stevia", "Erythritol", "Xylitol", "Monk Fruit", "Soy Sauce", "Fish Sauce", "Worcestershire Sauce", "Hot Sauce", "Sriracha", "Harissa", "Chimichurri", "Pesto", "Tahini", "Miso", "Hoisin Sauce", "Oyster Sauce", "Teriyaki Sauce", "Barbecue Sauce", "Ketchup", "Mustard", "Dijon Mustard", "Whole Grain Mustard", "Mayonnaise", "Aioli", "Hollandaise", "Béarnaise", "Chimichurri", "Salsa Verde", "Tapenade", "Chutney", "Relish", "Pickles", "Capers", "Olives", "Anchovies", "Sun-dried Tomatoes", "Roasted Red Peppers", "Truffle", "Caviar", "Foie Gras", "Uni", "Wagyu Beef", "Iberico Ham", "Prosciutto", "Pancetta", "Guanciale", "Bresaola", "Chorizo", "Merguez", "Andouille", "Boudin", "Confit", "Rillettes", "Pâté", "Terrine", "Charcuterie", "Artisanal Cheese", "Aged Cheese", "Raw Milk Cheese", "Specialty Vinegars", "Infused Oils", "Exotic Spices", "Heirloom Varieties", "Microgreens", "Edible Flowers", "Molecular Ingredients", "Liquid Nitrogen", "Agar", "Xanthan Gum", "Lecithin"];
export declare const NUTRITIONAL_GOALS: readonly ["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "HEART_HEALTHY", "DIABETIC_FRIENDLY", "LOW_SODIUM", "HIGH_PROTEIN", "LOW_CARB", "HIGH_FIBER"];
export declare const BUDGET_PREFERENCES: readonly ["BUDGET", "MODERATE", "PREMIUM", "LUXURY"];
export declare const MEAL_TYPES: readonly ["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "DESSERTS", "APPETIZERS", "BRUNCH", "LATE_NIGHT"];
export declare const COOKING_EQUIPMENT: readonly ["OVEN", "STOVETOP", "MICROWAVE", "GRILL", "AIR_FRYER", "SLOW_COOKER", "PRESSURE_COOKER", "BLENDER", "FOOD_PROCESSOR", "STAND_MIXER", "TOASTER_OVEN", "RICE_COOKER", "STEAMER", "DEEP_FRYER", "SOUS_VIDE"];
export declare const MEAL_COMPLEXITY: readonly ["ONE_POT", "SIMPLE", "MODERATE", "COMPLEX", "GOURMET"];
export declare const SPICE_TOLERANCE: readonly ["MILD", "MEDIUM", "HOT", "EXTREME"];
export declare const recipeGenerationSchema: z.ZodObject<{
    inspiration: z.ZodOptional<z.ZodString>;
    ingredients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cookingTime: z.ZodOptional<z.ZodNumber>;
    servings: z.ZodOptional<z.ZodNumber>;
    difficulty: z.ZodOptional<z.ZodEnum<["EASY", "MEDIUM", "HARD", "EXPERT"]>>;
    mealType: z.ZodOptional<z.ZodString>;
    additionalRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    inspiration?: string | undefined;
    ingredients?: string[] | undefined;
    cookingTime?: number | undefined;
    servings?: number | undefined;
    difficulty?: "MEDIUM" | "EXPERT" | "EASY" | "HARD" | undefined;
    mealType?: string | undefined;
    additionalRequests?: string | undefined;
}, {
    inspiration?: string | undefined;
    ingredients?: string[] | undefined;
    cookingTime?: number | undefined;
    servings?: number | undefined;
    difficulty?: "MEDIUM" | "EXPERT" | "EASY" | "HARD" | undefined;
    mealType?: string | undefined;
    additionalRequests?: string | undefined;
}>;
export declare const recipeRatingSchema: z.ZodObject<{
    rating: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    notes?: string | undefined;
}, {
    rating: number;
    notes?: string | undefined;
}>;
export type RecipeGenerationInput = z.infer<typeof recipeGenerationSchema>;
export type RecipeRatingInput = z.infer<typeof recipeRatingSchema>;
export declare function validateRecipeGeneration(data: any): {
    success: boolean;
    errors?: string[];
};
export declare function validateRecipeRating(data: any): {
    success: boolean;
    errors?: string[];
};
//# sourceMappingURL=validation.d.ts.map