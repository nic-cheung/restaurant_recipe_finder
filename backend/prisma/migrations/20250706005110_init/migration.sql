/*
  Warnings:

  - The values [Budget,Moderate,Premium,Luxury] on the enum `BudgetPreference` will be removed. If these variants are still used in the database, this will fail.
  - The values [Oven,Stovetop,Microwave,Grill,Air_Fryer,Slow_Cooker,Pressure_Cooker,Blender,Food_Processor,Stand_Mixer,Toaster_Oven,Rice_Cooker,Steamer,Deep_Fryer,Sous_Vide] on the enum `CookingEquipment` will be removed. If these variants are still used in the database, this will fail.
  - The values [One_Pot,Simple,Moderate,Complex,Gourmet] on the enum `MealComplexity` will be removed. If these variants are still used in the database, this will fail.
  - The values [Breakfast,Lunch,Dinner,Snacks,Desserts,Appetizers,Brunch,Late_Night] on the enum `MealType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Weight_Loss,Muscle_Gain,Maintenance,Heart_Healthy,Diabetic_Friendly,Low_Sodium,High_Protein,Low_Carb,High_Fiber] on the enum `NutritionalGoal` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BudgetPreference_new" AS ENUM ('BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY');
ALTER TABLE "user_preferences" ALTER COLUMN "budgetPreference" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "budgetPreference" TYPE "BudgetPreference_new" USING ("budgetPreference"::text::"BudgetPreference_new");
ALTER TYPE "BudgetPreference" RENAME TO "BudgetPreference_old";
ALTER TYPE "BudgetPreference_new" RENAME TO "BudgetPreference";
DROP TYPE "BudgetPreference_old";
ALTER TABLE "user_preferences" ALTER COLUMN "budgetPreference" SET DEFAULT 'MODERATE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CookingEquipment_new" AS ENUM ('OVEN', 'STOVETOP', 'MICROWAVE', 'GRILL', 'AIR_FRYER', 'SLOW_COOKER', 'PRESSURE_COOKER', 'BLENDER', 'FOOD_PROCESSOR', 'STAND_MIXER', 'TOASTER_OVEN', 'RICE_COOKER', 'STEAMER', 'DEEP_FRYER', 'SOUS_VIDE');
ALTER TABLE "user_preferences" ALTER COLUMN "availableEquipment" TYPE "CookingEquipment_new"[] USING ("availableEquipment"::text::"CookingEquipment_new"[]);
ALTER TYPE "CookingEquipment" RENAME TO "CookingEquipment_old";
ALTER TYPE "CookingEquipment_new" RENAME TO "CookingEquipment";
DROP TYPE "CookingEquipment_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MealComplexity_new" AS ENUM ('ONE_POT', 'SIMPLE', 'MODERATE', 'COMPLEX', 'GOURMET');
ALTER TABLE "user_preferences" ALTER COLUMN "mealComplexity" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "mealComplexity" TYPE "MealComplexity_new" USING ("mealComplexity"::text::"MealComplexity_new");
ALTER TYPE "MealComplexity" RENAME TO "MealComplexity_old";
ALTER TYPE "MealComplexity_new" RENAME TO "MealComplexity";
DROP TYPE "MealComplexity_old";
ALTER TABLE "user_preferences" ALTER COLUMN "mealComplexity" SET DEFAULT 'SIMPLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MealType_new" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'DESSERTS', 'APPETIZERS', 'BRUNCH', 'LATE_NIGHT');
ALTER TABLE "user_preferences" ALTER COLUMN "preferredMealTypes" TYPE "MealType_new"[] USING ("preferredMealTypes"::text::"MealType_new"[]);
ALTER TYPE "MealType" RENAME TO "MealType_old";
ALTER TYPE "MealType_new" RENAME TO "MealType";
DROP TYPE "MealType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NutritionalGoal_new" AS ENUM ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'HEART_HEALTHY', 'DIABETIC_FRIENDLY', 'LOW_SODIUM', 'HIGH_PROTEIN', 'LOW_CARB', 'HIGH_FIBER');
ALTER TABLE "user_preferences" ALTER COLUMN "nutritionalGoals" TYPE "NutritionalGoal_new"[] USING ("nutritionalGoals"::text::"NutritionalGoal_new"[]);
ALTER TYPE "NutritionalGoal" RENAME TO "NutritionalGoal_old";
ALTER TYPE "NutritionalGoal_new" RENAME TO "NutritionalGoal";
DROP TYPE "NutritionalGoal_old";
COMMIT;

-- AlterTable
ALTER TABLE "user_preferences" ALTER COLUMN "budgetPreference" SET DEFAULT 'MODERATE',
ALTER COLUMN "mealComplexity" SET DEFAULT 'SIMPLE';
