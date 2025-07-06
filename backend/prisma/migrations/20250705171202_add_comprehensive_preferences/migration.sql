-- CreateEnum
CREATE TYPE "NutritionalGoal" AS ENUM ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'HEART_HEALTHY', 'DIABETIC_FRIENDLY', 'LOW_SODIUM', 'HIGH_PROTEIN', 'LOW_CARB', 'HIGH_FIBER');

-- CreateEnum
CREATE TYPE "BudgetPreference" AS ENUM ('BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'DESSERTS', 'APPETIZERS', 'BRUNCH', 'LATE_NIGHT');

-- CreateEnum
CREATE TYPE "CookingEquipment" AS ENUM ('OVEN', 'STOVETOP', 'MICROWAVE', 'GRILL', 'AIR_FRYER', 'SLOW_COOKER', 'PRESSURE_COOKER', 'BLENDER', 'FOOD_PROCESSOR', 'STAND_MIXER', 'TOASTER_OVEN', 'RICE_COOKER', 'STEAMER', 'DEEP_FRYER', 'SOUS_VIDE');

-- CreateEnum
CREATE TYPE "MealComplexity" AS ENUM ('ONE_POT', 'SIMPLE', 'MODERATE', 'COMPLEX', 'GOURMET');

-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "availableEquipment" "CookingEquipment"[],
ADD COLUMN     "budgetPreference" "BudgetPreference" NOT NULL DEFAULT 'MODERATE',
ADD COLUMN     "mealComplexity" "MealComplexity" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "nutritionalGoals" "NutritionalGoal"[],
ADD COLUMN     "preferredMealTypes" "MealType"[];
