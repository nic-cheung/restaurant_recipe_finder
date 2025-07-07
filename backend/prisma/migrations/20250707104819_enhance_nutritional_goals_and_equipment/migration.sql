-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CookingEquipment" ADD VALUE 'OUTDOOR_SMOKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'PIZZA_OVEN';
ALTER TYPE "CookingEquipment" ADD VALUE 'FIRE_PIT';
ALTER TYPE "CookingEquipment" ADD VALUE 'CONVECTION_OVEN';
ALTER TYPE "CookingEquipment" ADD VALUE 'COUNTERTOP_CONVECTION';
ALTER TYPE "CookingEquipment" ADD VALUE 'INSTANT_POT';
ALTER TYPE "CookingEquipment" ADD VALUE 'DUTCH_OVEN';
ALTER TYPE "CookingEquipment" ADD VALUE 'TAGINE';
ALTER TYPE "CookingEquipment" ADD VALUE 'HIGH_SPEED_BLENDER';
ALTER TYPE "CookingEquipment" ADD VALUE 'IMMERSION_BLENDER';
ALTER TYPE "CookingEquipment" ADD VALUE 'HAND_MIXER';
ALTER TYPE "CookingEquipment" ADD VALUE 'MORTAR_PESTLE';
ALTER TYPE "CookingEquipment" ADD VALUE 'BAMBOO_STEAMER';
ALTER TYPE "CookingEquipment" ADD VALUE 'ELECTRIC_STEAMER';
ALTER TYPE "CookingEquipment" ADD VALUE 'DEHYDRATOR';
ALTER TYPE "CookingEquipment" ADD VALUE 'FERMENTATION_CROCK';
ALTER TYPE "CookingEquipment" ADD VALUE 'MANDOLINE_SLICER';
ALTER TYPE "CookingEquipment" ADD VALUE 'SPIRALIZER';
ALTER TYPE "CookingEquipment" ADD VALUE 'JUICER';
ALTER TYPE "CookingEquipment" ADD VALUE 'ESPRESSO_MACHINE';
ALTER TYPE "CookingEquipment" ADD VALUE 'BREAD_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'PASTA_MACHINE';
ALTER TYPE "CookingEquipment" ADD VALUE 'ICE_CREAM_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'YOGURT_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'WAFFLE_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'PANCAKE_GRIDDLE';
ALTER TYPE "CookingEquipment" ADD VALUE 'CREPE_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'FONDUE_POT';
ALTER TYPE "CookingEquipment" ADD VALUE 'INDOOR_GRILL';
ALTER TYPE "CookingEquipment" ADD VALUE 'PANINI_PRESS';
ALTER TYPE "CookingEquipment" ADD VALUE 'SANDWICH_MAKER';
ALTER TYPE "CookingEquipment" ADD VALUE 'ELECTRIC_WOK';
ALTER TYPE "CookingEquipment" ADD VALUE 'INDUCTION_COOKTOP';
ALTER TYPE "CookingEquipment" ADD VALUE 'PORTABLE_BURNER';
ALTER TYPE "CookingEquipment" ADD VALUE 'KITCHEN_SCALE';
ALTER TYPE "CookingEquipment" ADD VALUE 'DOUGH_MIXER';
ALTER TYPE "CookingEquipment" ADD VALUE 'PROOFING_BASKET';
ALTER TYPE "CookingEquipment" ADD VALUE 'BAKING_STONE';
ALTER TYPE "CookingEquipment" ADD VALUE 'SHEET_PAN';
ALTER TYPE "CookingEquipment" ADD VALUE 'CAST_IRON_SKILLET';
ALTER TYPE "CookingEquipment" ADD VALUE 'CARBON_STEEL_PAN';
ALTER TYPE "CookingEquipment" ADD VALUE 'COPPER_COOKWARE';
ALTER TYPE "CookingEquipment" ADD VALUE 'SMART_THERMOMETER';
ALTER TYPE "CookingEquipment" ADD VALUE 'VACUUM_SEALER';
ALTER TYPE "CookingEquipment" ADD VALUE 'SMOKING_GUN';
ALTER TYPE "CookingEquipment" ADD VALUE 'CULINARY_TORCH';
ALTER TYPE "CookingEquipment" ADD VALUE 'NITROUS_OXIDE_WHIPPER';
ALTER TYPE "CookingEquipment" ADD VALUE 'CHEF_KNIFE';
ALTER TYPE "CookingEquipment" ADD VALUE 'CUTTING_BOARD';
ALTER TYPE "CookingEquipment" ADD VALUE 'MIXING_BOWLS';
ALTER TYPE "CookingEquipment" ADD VALUE 'MEASURING_CUPS';
ALTER TYPE "CookingEquipment" ADD VALUE 'KITCHEN_THERMOMETER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NutritionalGoal" ADD VALUE 'ANTI_INFLAMMATORY';
ALTER TYPE "NutritionalGoal" ADD VALUE 'GUT_HEALTH';
ALTER TYPE "NutritionalGoal" ADD VALUE 'HORMONE_BALANCE';
ALTER TYPE "NutritionalGoal" ADD VALUE 'ENERGY_BOOST';
ALTER TYPE "NutritionalGoal" ADD VALUE 'IMMUNE_SUPPORT';
ALTER TYPE "NutritionalGoal" ADD VALUE 'BRAIN_HEALTH';
ALTER TYPE "NutritionalGoal" ADD VALUE 'LONGEVITY';
ALTER TYPE "NutritionalGoal" ADD VALUE 'METABOLISM_BOOST';
ALTER TYPE "NutritionalGoal" ADD VALUE 'STRESS_REDUCTION';
ALTER TYPE "NutritionalGoal" ADD VALUE 'SLEEP_IMPROVEMENT';
ALTER TYPE "NutritionalGoal" ADD VALUE 'INTERMITTENT_FASTING';
ALTER TYPE "NutritionalGoal" ADD VALUE 'PLANT_BASED';
ALTER TYPE "NutritionalGoal" ADD VALUE 'MEDITERRANEAN';
ALTER TYPE "NutritionalGoal" ADD VALUE 'KETO_FRIENDLY';
ALTER TYPE "NutritionalGoal" ADD VALUE 'PALEO_FRIENDLY';
ALTER TYPE "NutritionalGoal" ADD VALUE 'WHOLE30_COMPATIBLE';
ALTER TYPE "NutritionalGoal" ADD VALUE 'ATHLETIC_PERFORMANCE';
ALTER TYPE "NutritionalGoal" ADD VALUE 'POST_WORKOUT_RECOVERY';
ALTER TYPE "NutritionalGoal" ADD VALUE 'PRENATAL_NUTRITION';
ALTER TYPE "NutritionalGoal" ADD VALUE 'HEALTHY_AGING';
ALTER TYPE "NutritionalGoal" ADD VALUE 'DETOX_SUPPORT';
ALTER TYPE "NutritionalGoal" ADD VALUE 'BONE_HEALTH';
ALTER TYPE "NutritionalGoal" ADD VALUE 'SKIN_HEALTH';
ALTER TYPE "NutritionalGoal" ADD VALUE 'DIGESTIVE_HEALTH';
