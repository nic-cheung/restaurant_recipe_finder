# Lessons Learned - Restaurant Recipe Finder

## 📚 Project Knowledge Base
This file documents errors, issues, and learnings encountered during development to prevent recurring problems and build institutional knowledge.

---

## Enhancement: Enhanced Meal Types System - From Generic to Granular
**Date**: 2025-07-07
**Context**: User feedback indicated that basic meal types (8 options: BREAKFAST, LUNCH, DINNER, etc.) were too generic and vague for sophisticated users wanting specific meal categorization
**Challenge**: Expanding meal types from 8 to 47 categories while maintaining backward compatibility and updating both preferences page and registration process
**Solution**: Systematic enhancement across database, backend, and frontend with organized categorization and popular suggestions

**Implementation Process**:

1. **Backend Enhancement**:
   - Updated `MEAL_TYPES` array in `backend/src/utils/validation.ts` from 8 to 47 categories
   - Organized categories by theme: Traditional, Snacks & Light, Desserts, Beverages, Meal Prep, Special Occasions, Health & Wellness, International, Dietary Specific, Cooking Methods
   - Added `POPULAR_MEAL_TYPES` array with 15 top suggestions for quick selection
   - Updated preferences controller to include `popularMealTypes` in API responses

2. **Database Migration**:
   - Enhanced `MealType` enum in `backend/prisma/schema.prisma` with all 47 categories
   - Applied database migration `enhance_meal_types` to update existing data
   - Ensured backward compatibility with existing user preferences

3. **Frontend Integration**:
   - Updated `frontend/src/types/preferences.ts` with enhanced meal types
   - Enhanced `DynamicSuggestionInput` component to support popular suggestions
   - Updated both preferences page AND registration process (Step 5)
   - Renamed field from "Meal Types" to "Preferred Meal Categories" for clarity
   - Restructured registration layout per user request (meal categories below budget preferences)

4. **API Enhancement**:
   - Added public API endpoint `/api/preferences/public/options` for unauthenticated access
   - Included `popularMealTypes` in response for registration process
   - Maintained backward compatibility with existing API consumers

**Key Insights**:
- **User Feedback is Gold**: Generic options frustrate sophisticated users who want specificity
- **Systematic Enhancement**: Changes need to be coordinated across database, backend, frontend, and API
- **Backward Compatibility**: Existing user data must remain valid during enhancements
- **Popular Suggestions**: Quick-select options significantly improve user experience
- **Registration vs Preferences**: Both flows need feature parity for consistency
- **Field Naming**: Clear, descriptive field names improve user understanding
- **Layout Matters**: User-requested layout changes (meal categories below budget) improve UX

**Technical Challenges Resolved**:
- **TypeScript Compilation**: Updated all interfaces to prevent compilation errors
- **Database Migration**: Carefully expanded enum without breaking existing data
- **Public API Access**: Created unauthenticated endpoints for registration process
- **Component Reusability**: Enhanced DynamicSuggestionInput to support popular suggestions
- **Feature Parity**: Ensured registration and preferences pages had identical functionality

**Best Practices Discovered**:
- **Organize by Theme**: Group related options together for better user comprehension
- **Popular Suggestions**: Always provide quick-select options for common choices
- **Comprehensive Testing**: Test both authenticated and unauthenticated flows
- **User-Centric Design**: Field names and layouts should match user mental models
- **Incremental Enhancement**: Build on existing components rather than rebuilding from scratch

**Prevention/Improvement Strategies**:
- **User Research**: Gather feedback on generic vs specific options early in design
- **Scalable Architecture**: Design data structures that can accommodate future expansion
- **Component Flexibility**: Build reusable components that can adapt to different data sets
- **API Design**: Consider both authenticated and unauthenticated access patterns
- **Documentation**: Document the reasoning behind categorization choices
- **Testing Strategy**: Test feature parity across all user flows (registration, preferences, etc.)

**Metrics/Results**:
- **Before**: 8 generic meal types (BREAKFAST, LUNCH, DINNER, SNACKS, DESSERTS, APPETIZERS, BRUNCH, LATE_NIGHT)
- **After**: 47 specific meal categories organized by theme + 15 popular suggestions
- **User Experience**: Much more granular meal categorization for precise recipe personalization
- **Technical Debt**: Zero - maintained backward compatibility and clean architecture
- **Development Time**: ~4 hours for complete implementation across all layers

**Related**: 
- [Database Schema Evolution](https://martinfowler.com/articles/evolvingSchemas.html)
- [API Versioning Strategies](https://restfulapi.net/versioning/)
- [User Experience Design Principles](https://www.nngroup.com/articles/ten-usability-heuristics/)

---

## Error: API Contract Mismatch - Recipe Save Endpoint
**Date**: 2025-01-28
**Context**: Users trying to save recipes after generation, receiving 400 Bad Request error with "Recipe data is required"
**Error**: `POST http://localhost:8000/api/recipes/save 400 (Bad Request)` - Backend rejecting recipe data despite data being present
**Root Cause**: Frontend and backend were using different property names for recipe data:
- Frontend sending: `{ recipeData: { title: "...", ingredients: [...], ... } }`
- Backend expecting: `{ recipe: { title: "...", ingredients: [...], ... } }`
- Backend controller was destructuring `const { recipe } = req.body` but frontend was sending `recipeData`

**Solution**: Fixed the frontend API service to match backend expectations:
```typescript
// BEFORE (problematic):
async saveRecipe(recipeData: any): Promise<RecipeSaveResponse> {
  return this.request<RecipeSaveResponse>('/recipes/save', {
    method: 'POST',
    body: JSON.stringify({ recipeData }),  // Wrong property name
  });
}

// AFTER (fixed):
async saveRecipe(recipeData: any): Promise<RecipeSaveResponse> {
  return this.request<RecipeSaveResponse>('/recipes/save', {
    method: 'POST',
    body: JSON.stringify({ recipe: recipeData }),  // Correct property name
  });
}
```

**Key Insights**:
- **API Contract Consistency**: Frontend and backend must agree on exact property names and structure
- **Error Messages Can Be Misleading**: "Recipe data is required" didn't indicate the property name mismatch
- **Multiple Endpoints**: Different endpoints may have different expected formats (generate vs save)
- **TypeScript Limitations**: TypeScript interfaces don't prevent runtime property name mismatches

**Prevention**: 
- **Document API contracts clearly** with exact property names and structure
- **Use shared TypeScript interfaces** between frontend and backend when possible
- **Test API endpoints independently** with tools like Postman/Insomnia
- **Add better error messages** on backend that specify exact requirements
- **Use consistent naming conventions** across all endpoints
- **Add integration tests** that verify frontend/backend data flow
- **Review API service methods** when backend endpoints are modified
- **Use request/response validation** with tools like Zod on both sides

**Related**: 
- [API Design Best Practices](https://restfulapi.net/)
- [TypeScript Shared Types](https://www.typescriptlang.org/docs/)
- [Zod Validation Library](https://zod.dev/)

---

## Error: Database Unique Constraint Violation - Favorites Functionality  
**Date**: 2025-01-28
**Context**: Users trying to favorite recipes, receiving 500 Internal Server Error
**Error**: `POST http://localhost:8000/api/recipes/{id}/favorite 500 (Internal Server Error)` - Backend throwing database constraint errors
**Root Cause**: Backend service was trying to create duplicate favorite records without checking if the recipe was already favorited:
- `prisma.favoriteRecipe.create()` called without checking for existing records
- Unique constraint on `[userId, recipeId]` in FavoriteRecipe table was violated
- No duplicate prevention logic in the `addToFavorites` method

**Solution**: Added duplicate checking and improved error handling:
```typescript
// BEFORE (problematic):
async addToFavorites(userId: string, recipeId: string): Promise<void> {
  await prisma.favoriteRecipe.create({
    data: { userId, recipeId }  // Could fail on duplicate
  });
}

// AFTER (fixed):
async addToFavorites(userId: string, recipeId: string): Promise<void> {
  // Check if already favorited
  const existingFavorite = await prisma.favoriteRecipe.findUnique({
    where: { userId_recipeId: { userId, recipeId } }
  });
  
  if (existingFavorite) {
    return; // Already favorited, graceful exit
  }
  
  await prisma.favoriteRecipe.create({
    data: { userId, recipeId }
  });
}
```

**Key Insights**:
- **Database Constraints Matter**: Unique constraints are enforced at database level, not application level
- **Idempotent Operations**: Favorite/unfavorite operations should be idempotent (safe to call multiple times)
- **500 vs 400 Errors**: Database constraint violations cause 500 errors, not validation errors (400)
- **Graceful Degradation**: Operations like "favorite" should succeed silently if already done

**Prevention**: 
- **Always check for existing records** before creating new ones with unique constraints
- **Use upsert operations** when appropriate for create-or-update scenarios
- **Make operations idempotent** - safe to call multiple times with same result
- **Handle constraint violations gracefully** rather than letting them bubble up as 500 errors
- **Test edge cases** like duplicate operations, not just happy path
- **Use `deleteMany()`** instead of `delete()` for remove operations to avoid "not found" errors
- **Add integration tests** for database constraint scenarios
- **Log constraint violations** clearly to help with debugging

**Related**: 
- [Prisma Unique Constraints](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#unique-constraints)
- [Database Design Patterns](https://en.wikipedia.org/wiki/Database_design)
- [Idempotent Operations](https://en.wikipedia.org/wiki/Idempotence)

---

## Error: Frontend Server Startup Issues - Vite Version and Port Configuration
**Date**: 2025-07-06
**Context**: Application servers stopping unexpectedly, frontend not accessible, confusion about correct ports
**Error**: Multiple cascading issues:
1. Backend server process hanging/stopping despite nodemon still running
2. Frontend server not starting on expected port 3000
3. `npx vite` using different version and port (5173) than project's `npm run dev` (3000)
4. Process cleanup confusion - multiple stale processes running
5. `ERR_CONNECTION_REFUSED` errors during login attempts

**Root Cause**: Several interconnected issues:
1. **Process Management**: Server processes can hang or stop responding while their parent processes still appear to be running
2. **Vite Version Differences**: Global `npx vite` (v7.0.2) vs project's local Vite (v5.4.19) have different default ports
3. **Port Configuration**: Project configured for port 3000 but manual `npx vite` defaulted to 5173
4. **Stale Process Cleanup**: Multiple npm/node processes accumulating without proper cleanup

**Solution**: Systematic debugging and process management:

1. **Health Check First**:
```bash
# Always start with health checks
curl -s http://localhost:8000/health || echo "Backend not responding"
curl -I http://localhost:3000 || echo "Frontend not responding"
```

2. **Process Identification and Cleanup**:
```bash
# Find all related processes
ps aux | grep -E "(node|nodemon|ts-node|vite|npm)" | grep -v grep

# Kill specific stale processes
kill [PID]

# Check what's listening on ports
lsof -i :3000
lsof -i :8000
```

3. **Correct Startup Sequence**:
```bash
# Backend
cd backend && npm run dev

# Frontend (use project's npm script, not npx vite)
cd frontend && npm run dev
```

4. **Port Verification**:
```bash
# Verify correct ports after startup
echo "=== Backend Health ===" && curl -s http://localhost:8000/health
echo "=== Frontend Status ===" && curl -I http://localhost:3000
```

**Key Insights**:
- **Use Project Scripts**: Always use `npm run dev` instead of `npx vite` directly to ensure correct configuration
- **Port Consistency**: Frontend should be on port 3000, backend on 8000 - verify after startup
- **Process Management**: Check process status AND actual port listening, not just ps output
- **Health Checks**: Implement systematic health checking before debugging complex issues
- **Version Differences**: Global vs local tool versions can have different default configurations

**Prevention**: 
- **Always use project scripts** (`npm run dev`) instead of global commands (`npx vite`)
- **Implement health check endpoints** and use them for troubleshooting
- **Document expected ports** and verify them after startup
- **Clean up stale processes** before starting new ones
- **Use background processes carefully** - monitor their actual status, not just parent process
- **Test both backend and frontend** independently before testing integration
- **Check port conflicts** before assuming server startup issues

**Related**: 
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [Node.js Process Management](https://nodejs.org/api/process.html)
- [Unix Process Management](https://man7.org/linux/man-pages/man1/ps.1.html)

---

## Error: Favorites Functionality - Backend Data Structure Mismatch
**Date**: 2025-07-06
**Context**: Favorites button working for API calls but UI not updating correctly, stats not reflecting changes
**Error**: Multiple interconnected issues:
1. Backend `getUserRecipes` method returning basic recipe data without `userRecipe` relationship
2. Frontend expecting `userRecipe` object with `isFavorite` field but not receiving it
3. Recipe stats not updating when toggling favorites from "All Recipes" tab
4. API calls succeeding (200 OK) but UI showing stale state

**Root Cause**: Backend-Frontend data structure mismatch:
- **Backend**: `getUserRecipes` only returned recipe data: `recipes.map(ur => ur.recipe)`
- **Frontend**: Expected `RecipeWithUserData` structure with `userRecipe` field containing `isFavorite`
- **Stats Issue**: Frontend only refreshed `favoriteRecipes` when on "Favorites" tab, not when toggling from "All Recipes"
- **TypeScript Types**: Frontend types didn't match actual backend response structure

**Solution**: Comprehensive backend and frontend alignment:

1. **Backend - Return Complete Data Structure**:
```typescript
// BEFORE (problematic):
async getUserRecipes(userId: string, limit = 20, offset = 0): Promise<Recipe[]> {
  const userRecipes = await prisma.userRecipe.findMany({
    where: { userId },
    include: { recipe: true },
    // ...
  });
  return userRecipes.map(ur => ur.recipe); // Missing userRecipe data
}

// AFTER (fixed):
async getUserRecipes(userId: string, limit = 20, offset = 0): Promise<(Recipe & { userRecipe: any })[]> {
  const userRecipes = await prisma.userRecipe.findMany({
    where: { userId },
    include: { recipe: true },
    // ...
  });
  return userRecipes.map(ur => ({
    ...ur.recipe,
    userRecipe: {
      id: ur.id,
      userId: ur.userId,
      recipeId: ur.recipeId,
      rating: ur.rating,
      notes: ur.notes,
      cookedDate: ur.cookedDate,
      isFavorite: ur.isFavorite, // Critical field for UI
      createdAt: ur.createdAt,
      updatedAt: ur.updatedAt,
    },
  }));
}
```

2. **Frontend - Always Refresh Favorites for Stats**:
```typescript
// BEFORE (problematic):
const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
  // ... API call
  loadRecipes();
  if (activeTab === 'favorites') {
    loadFavorites(); // Only refresh if on favorites tab
  }
};

// AFTER (fixed):
const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
  // ... API call
  loadRecipes();
  loadFavorites(); // Always refresh for stats accuracy
};
```

3. **TypeScript Type Alignment**:
```typescript
// Updated response types to match backend
export interface UserRecipesResponse {
  success: boolean;
  recipes: RecipeWithUserData[]; // Was: SavedRecipe[]
  pagination: PaginationInfo;
}

export interface FavoriteRecipesResponse {
  success: boolean;
  recipes: RecipeWithUserData[]; // Was: SavedRecipe[]
}
```

**Key Insights**:
- **Data Structure Contracts**: Backend and frontend must have exact agreement on response structure
- **State Management**: UI stats depend on multiple state variables that must all be kept in sync
- **API Call Success ≠ UI Update**: API calls can succeed while UI remains stale due to missing data
- **TypeScript Type Safety**: Type definitions must match actual runtime data structure
- **Conditional Logic Pitfalls**: Conditional state updates can cause partial UI updates

**Prevention**: 
- **Document API Response Structure** with exact field names and nested objects
- **Test Both API and UI** - verify data flows from backend to frontend UI
- **Use Type Guards** to validate runtime data matches TypeScript types
- **Implement Comprehensive State Updates** - update all dependent state variables
- **Add Integration Tests** that verify full data flow from API to UI
- **Use TypeScript Strict Mode** to catch type mismatches early
- **Review State Dependencies** when implementing toggle/update functionality
- **Test Edge Cases** like toggling from different tabs/contexts

**Related**: 
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [React State Management Best Practices](https://reactjs.org/docs/state-and-lifecycle.html)
- [API Design Patterns](https://restfulapi.net/)

---

## Error: TagSelector Infinite Loop and React Key Duplication
**Date**: 2025-07-05
**Context**: Implementing comprehensive user preferences with TagSelector components across multiple fields
**Error**: Multiple cascading issues:
1. `TypeError: Cannot read properties of undefined (reading 'includes')` and `(reading 'slice')` in TagSelector
2. React warnings about duplicate keys like `dropdown-Eggs Benedict`, `dropdown-Pancakes`
3. "Maximum update depth exceeded" warning causing infinite re-renders
4. Missing dropdown suggestions and inconsistent tag colors

**Root Cause**: Complex interaction of multiple issues:
1. **Undefined Props**: TagSelector component wasn't handling undefined/null props gracefully
2. **React Key Duplication**: Multiple TagSelector components using same key prefixes, causing conflicts when same items appeared across different components
3. **Infinite Loop**: `useEffect` dependency arrays included arrays created with spread operator `[...new Set(...)]`, creating new references on every render
4. **Backend/Frontend Mismatch**: API returning enum values (`WEIGHT_LOSS`) while frontend expected human-readable format (`Weight Loss`)

**Solution**: Multi-step comprehensive fix:

1. **Defensive Programming in TagSelector**:
```typescript
// Added default values and safe variables
const TagSelector = ({ 
  selectedItems = [], 
  popularOptions = [], 
  allOptions = [], 
  componentId = 'default',
  // ... other props
}) => {
  // Used useMemo to prevent infinite loops
  const safeSelectedItems = useMemo(() => [...new Set(selectedItems || [])], [selectedItems]);
  const safePopularOptions = useMemo(() => [...new Set(popularOptions || [])], [popularOptions]);
  const safeAllOptions = useMemo(() => [...new Set(allOptions || [])], [allOptions]);
```

2. **Unique Component Keys**:
```typescript
// Added componentId prop and unique key prefixes
key={`${componentId}-popular-${tag}`}
key={`${componentId}-selected-${item}`}
key={`${componentId}-dropdown-${option}`}
```

3. **Enum/Human-Readable Conversion**:
```typescript
// Added conversion functions for API data
const convertEnumToReadable = (enumValue: string): string => {
  return enumValue.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const convertReadableToEnum = (readable: string): string => {
  return readable.toUpperCase().replace(/\s+/g, '_');
};
```

4. **Backend TypeScript Fixes**:
- Fixed unused import warnings by removing/commenting unused imports
- Added proper spiceTolerance field to UserPreferencesResponse type
- Fixed parameter naming (`req` → `_req`) for unused parameters

5. **Static Fallbacks**:
```typescript
// Added static suggestions for when API fails
const POPULAR_CHEFS = ['Thomas Keller', 'Julia Child', 'Anthony Bourdain', ...];
const POPULAR_RESTAURANTS = ['The French Laundry', 'Eleven Madison Park', ...];
```

**Prevention**: 
- **Always use default values** for props that might be undefined
- **Use useMemo for computed arrays** to prevent infinite re-renders
- **Implement unique component IDs** for reusable components to prevent key conflicts
- **Add comprehensive TypeScript types** and handle all possible undefined states
- **Test with real API data** early to catch enum/format mismatches
- **Use defensive programming** - assume props might be undefined/null
- **Document complex component interactions** and data flow expectations
- **Test component isolation** - ensure components work independently
- **Add proper error boundaries** for graceful degradation
- **Use static fallbacks** for external API dependencies

**Related**: 
- [React Keys Documentation](https://reactjs.org/docs/lists-and-keys.html)
- [React useMemo Hook](https://reactjs.org/docs/hooks-reference.html#usememo)
- [React useEffect Dependencies](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)

---

## Error: Multi-line Git Commit Messages in Terminal
**Date**: 2025-07-05
**Context**: Trying to commit development rules with a detailed multi-line commit message
**Error**: Commit command hung with `dquote>` prompt, wouldn't complete
**Root Cause**: Terminal git commit with `-m` flag doesn't handle complex multi-line messages well with special characters
**Solution**: Use simple single-line commit messages, or use `git commit` without `-m` to open editor
**Prevention**: 
- Keep commit messages concise and single-line when using `-m` flag
- For detailed commits, use `git commit` to open editor instead
- Test commit message format before important commits
**Related**: [Git commit message best practices](https://chris.beams.io/posts/git-commit/)

---

## Error: API Authentication Headers Not Being Sent (401 Unauthorized)
**Date**: 2025-07-05
**Context**: User preferences PUT request failing with 401 "Access token required" error, while GET requests worked fine
**Error**: `PUT http://localhost:8000/api/preferences 401 (Unauthorized)` - Authorization header not being sent despite token being present in localStorage
**Root Cause**: In the API service's `request` method, the `...options` spread was placed after the headers object, potentially overriding the Authorization header when request options included headers
**Solution**: Moved the `...options` spread before the headers object in the request configuration:
```typescript
// BEFORE (problematic):
const config: RequestInit = {
  headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
  ...options,  // This could override headers
};

// AFTER (fixed):
const config: RequestInit = {
  ...options,  // Spread options first
  headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
};
```
**Prevention**: 
- Always be careful with object spread order when merging configurations
- Test authenticated API calls thoroughly, especially PUT/POST requests
- Use debugging logs to verify header contents during development
- Consider using a more explicit header merging approach for critical headers
**Related**: [MDN RequestInit documentation](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)

---

## Error: React HMR "useAuth must be used within AuthProvider" Errors
**Date**: 2025-07-05
**Context**: Console showing uncaught React errors during development with Hot Module Reloading (HMR)
**Error**: `Uncaught (in promise) Error: useAuth must be used within an AuthProvider` in Header and ProtectedRoute components during development
**Root Cause**: React Fast Refresh/HMR temporarily renders components outside of the AuthProvider context during code hot-reloading, causing the useAuth hook to throw errors
**Solution**: 
1. Modified useAuth hook to provide fallback values during HMR instead of throwing errors
2. Created ErrorBoundary component to catch and handle React errors gracefully
3. Added ErrorBoundary wrapper to App component for comprehensive error handling

```typescript
// In AuthContext.tsx - Added fallback for HMR
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During HMR, provide a fallback to prevent crashes
    console.warn('useAuth called outside AuthProvider - this may be due to HMR');
    return {
      user: null, token: null, login: async () => {}, 
      register: async () => {}, logout: async () => {}, isLoading: false,
    } as AuthContextType;
  }
  return context;
};
```

**Prevention**: 
- Always provide fallback handling in custom hooks that depend on React context
- Add ErrorBoundary components to catch unexpected React errors
- Test components during development hot-reloading scenarios
- Consider graceful degradation for development-specific issues
- Use console warnings instead of throwing errors for HMR-related issues
**Related**: [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html), [React Fast Refresh](https://github.com/facebook/react/tree/main/packages/react-refresh)

---

## Error: Import/Export Naming Mismatch - Component Import Failure
**Date**: 2025-07-06
**Context**: Implementing Google Places API usage tracking with new `ApiUsageDisplay` component
**Error**: `Uncaught SyntaxError: The requested module '/src/services/api.ts' does not provide an export named 'api'`
**Root Cause**: 
- `ApiUsageDisplay` component imported `{ api }` from `../services/api`
- But the API service actually exports `apiService`, not `api`
- This created a module import mismatch causing the component to fail to load

**Solution**: 
1. **Fixed Import Statement**:
```typescript
// BEFORE (incorrect):
import { api } from '../services/api';

// AFTER (correct):
import { apiService } from '../services/api';
```

2. **Updated All References**:
```typescript
// BEFORE:
const response = await api.get<ResponseType>('/endpoint');

// AFTER:
const response = await apiService.get<ResponseType>('/endpoint');
```

3. **Fixed Response Type Handling**:
```typescript
// Backend returns: { success: boolean; data: ApiUsageResponse }
// So we access response.success and response.data directly
if (response.success) {
  setUsageData(response.data);
}
```

**Prevention**: 
- **Consistent Export Naming**: Use clear, descriptive export names that match their usage
- **Auto-import Tools**: Use IDE auto-import features to prevent manual naming errors
- **Export Documentation**: Document main exports in service files
- **Type Checking**: Enable proper TypeScript checking to catch these at compile time
- **Component Testing**: Test new components in isolation to catch import issues early

**Related Files**:
- `frontend/src/services/api.ts` - Service exports `apiService`
- `frontend/src/components/ApiUsageDisplay.tsx` - Component that needed the fix

**Additional Context**:
- This occurred while implementing Google Places API usage tracking
- The API service has both individual methods and a generic `get()` method
- Port conflicts (EADDRINUSE) also occurred during testing, requiring server restart

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: TypeScript Compilation Errors - Unused Imports and Missing Properties
**Date**: 2025-07-05
**Context**: Backend server crashing during development with TypeScript compilation errors
**Error**: Multiple TypeScript compilation issues:
1. `error TS6133: 'openaiService' is declared but its value is never read`
2. `error TS2304: Cannot find name 'openaiService'` 
3. `error TS2322: Property 'spiceTolerance' is missing in type 'UserPreferencesResponse'`
4. `error TS6133: 'req' is declared but its value is never read` in route handlers

**Root Cause**: 
1. **Unused Imports**: Import statements for services that were temporarily removed or commented out
2. **Missing Properties**: TypeScript interface definitions not matching database schema changes
3. **Unused Parameters**: Route handlers with unused `req` parameters triggering strict TypeScript warnings

**Solution**: 
1. **Remove Unused Imports**: Delete or comment out import statements for services not currently used
2. **Add Missing Properties**: Update TypeScript interfaces to include all required fields from database schema
3. **Fix Unused Parameters**: Prefix unused parameters with underscore (`_req`) or remove if not needed
4. **Consistent Schema**: Ensure TypeScript types match Prisma schema definitions exactly

**Learning**: 
- Keep TypeScript interfaces synchronized with database schema changes
- Use TypeScript strict mode to catch unused imports/parameters early
- Prefix unused parameters with underscore to indicate intentional non-use
- Remove unused imports immediately to avoid compilation errors

---

## Error: Port Already in Use (EADDRINUSE)
**Date**: 2025-07-05
**Context**: Backend server repeatedly failing to start on port 8000
**Error**: `Error: listen EADDRINUSE: address already in use :::8000`

**Root Cause**: 
1. **Multiple Server Instances**: Previous server instances not properly terminated
2. **Nodemon Restart Conflicts**: Nodemon restarting while previous instance still running
3. **Process Management**: Lack of proper process cleanup between development sessions

**Solution**: 
1. **Kill Existing Processes**: `pkill -f "ts-node"` and `pkill -f "nodemon"`
2. **Check Port Usage**: `lsof -i :8000` to identify processes using the port
3. **Proper Shutdown**: Use Ctrl+C to properly terminate servers before restarting
4. **Process Cleanup**: Add cleanup scripts to kill all related processes

**Learning**: 
- Always properly terminate development servers before restarting
- Use process management commands to clean up zombie processes
- Implement proper signal handling for graceful server shutdown
- Consider using different ports for different development sessions

---

## Error: OpenAI API Key Authentication Failure
**Date**: 2025-07-05
**Context**: Backend server crashing when trying to use OpenAI services
**Error**: `OpenAIError: The OPENAI_API_KEY environment variable is missing or empty`

**Root Cause**: 
1. **Missing Environment Variable**: No `.env` file or missing `OPENAI_API_KEY` entry
2. **Invalid API Key**: Using dummy/placeholder API key values
3. **Service Initialization**: OpenAI service initializing before environment variables loaded

**Solution**: 
1. **Environment Setup**: Create `.env` file with valid `OPENAI_API_KEY=your_actual_key`
2. **Dummy Key Fallback**: Use `OPENAI_API_KEY=dummy_key` for development when API not needed
3. **Error Handling**: Implement proper error handling for API key failures
4. **Service Fallbacks**: Provide static fallback responses when API calls fail

**Learning**: 
- Always provide fallback behavior for external API dependencies
- Use environment variables for sensitive configuration
- Implement graceful degradation when external services are unavailable
- Document required environment variables in README

---

## Error: Frontend Build Warnings - Vite and Module Type Issues
**Date**: 2025-07-05
**Context**: Frontend development server showing deprecation warnings and module type issues
**Error**: 
1. `The CJS build of Vite's Node API is deprecated`
2. `Module type of file:///postcss.config.js is not specified`
3. `Port 3000 is in use, trying another one...`

**Root Cause**: 
1. **Vite Deprecation**: Using deprecated CommonJS build of Vite
2. **Module Type Configuration**: Missing `"type": "module"` in package.json
3. **Port Conflicts**: Multiple frontend instances running simultaneously

**Solution**: 
1. **Update Vite Configuration**: Migrate to ESM build of Vite
2. **Package.json Type**: Add `"type": "module"` to package.json
3. **Port Management**: Use different ports or properly terminate previous instances
4. **Configuration Updates**: Update PostCSS and other configs for ESM compatibility

**Learning**: 
- Keep build tools updated to avoid deprecation warnings
- Properly configure module types for modern JavaScript
- Manage development server ports to avoid conflicts
- Address deprecation warnings early to prevent future issues

---

## Error: Database Schema Mismatch - Prisma Migration Issues
**Date**: 2025-07-05
**Context**: Database schema not synchronized with application code
**Error**: Missing fields in database that are required by TypeScript interfaces

**Root Cause**: 
1. **Schema Drift**: Database schema not updated after code changes
2. **Migration Conflicts**: Prisma migrations not properly applied
3. **Type Mismatches**: TypeScript expecting fields that don't exist in database

**Solution**: 
1. **Run Migrations**: `npx prisma migrate dev` to apply pending migrations
2. **Reset Database**: `npx prisma migrate reset` for clean state if needed
3. **Generate Client**: `npx prisma generate` to update Prisma client
4. **Schema Sync**: Ensure Prisma schema matches TypeScript interfaces

**Learning**: 
- Always run migrations after schema changes
- Keep database schema synchronized with application code
- Use Prisma Studio to verify database state
- Document migration procedures for team members

---

## Error: 429 "Too Many Requests" When Saving Preferences
**Date**: 2025-07-05
**Context**: User attempting to save preferences through the frontend UI
**Error**: `PUT http://localhost:8000/api/preferences 429 (Too Many Requests)` - Rate limiting preventing users from saving preferences during normal usage
**Root Cause**: Backend rate limiting configuration was too aggressive for development environment:
- General API limit: 100 requests per 15 minutes
- No separate rate limits for different endpoint types
- Development and production using same restrictive limits

**Solution**: Implemented environment-specific rate limiting:
```typescript
// Different limits for development vs production
const generalLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Separate preferences rate limiter (more lenient)
const preferencesLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 200 : 50, // 200 for dev, 50 for prod
  message: 'Too many preference requests, please try again later.',
});

// Apply to specific routes
app.use('/api/preferences', preferencesLimiter, preferenceRoutes);
```

**Prevention**: 
- **Environment-specific configuration**: Use different rate limits for development vs production
- **Endpoint-specific limits**: Critical user-facing endpoints need more lenient limits
- **Rate limit headers**: Include headers to help debug rate limiting issues
- **User feedback**: Provide clear error messages when rate limits are hit
- **Testing consideration**: Account for rate limiting when doing comprehensive testing
**Related**: [Express Rate Limit Documentation](https://github.com/nfriedly/express-rate-limit)

---

## Error: TypeScript Compilation Failures Due to Unused Imports
**Date**: 2025-07-05
**Context**: Backend server failing to start due to TypeScript compilation errors
**Error**: Multiple TypeScript errors:
1. `'openaiService' is declared but its value is never read` in preferencesController.ts
2. `'NUTRITIONAL_GOALS', 'BUDGET_PREFERENCES', etc. is declared but its value is never read`
3. `'req' is declared but its value is never read` in route handlers
4. `Property 'spiceTolerance' is missing in type` errors

**Root Cause**: 
- Imported modules/enums but didn't use them in the code
- Route handlers with unused request parameters
- TypeScript interface mismatches between database schema and response types

**Solution**: 
1. **Remove unused imports**: Commented out or removed imports that weren't being used
2. **Prefix unused parameters**: Changed `req` to `_req` for unused parameters
3. **Fix type definitions**: Added missing properties to TypeScript interfaces
4. **Use imported enums**: Actually utilize imported enum values or remove the imports

```typescript
// Fixed unused parameter
router.get('/suggestions/equipment', authenticateToken, (_req, res) => {
  // No longer throws TS6133 error
});

// Fixed missing interface property
interface UserPreferencesResponse {
  // ... other properties
  spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME'; // Added missing property
}
```

**Prevention**: 
- **Enable strict TypeScript checking** in development
- **Remove unused imports immediately** when refactoring code
- **Use TypeScript plugins** in IDE to highlight unused imports
- **Regular code cleanup** to remove dead code
- **Interface synchronization** - keep TypeScript interfaces in sync with database schema
**Related**: [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

---

## Error: Port Already in Use (EADDRINUSE) During Development
**Date**: 2025-07-05
**Context**: Attempting to restart backend server during development
**Error**: `Error: listen EADDRINUSE: address already in use :::8000` - Backend server unable to start because port 8000 is already occupied
**Root Cause**: Previous server process not properly terminated, leaving port 8000 occupied

**Solution**: 
1. **Kill existing processes**: `pkill -f "ts-node" && pkill -f "nodemon"`
2. **Wait for cleanup**: `sleep 2` to allow processes to fully terminate
3. **Restart with environment**: `OPENAI_API_KEY=dummy_key npm run dev`

**Prevention**: 
- **Proper process management**: Always terminate previous processes before starting new ones
- **Use process managers**: Consider using PM2 or similar for better process control
- **Port detection**: Check if port is available before starting server
- **Graceful shutdown**: Implement proper signal handling for clean shutdowns
- **Development scripts**: Create helper scripts for common development tasks
**Related**: [Node.js Process Management](https://nodejs.org/api/process.html)

---

## Error: OpenAI API Authentication Failures in Development
**Date**: 2025-07-05
**Context**: Backend making requests to OpenAI API for suggestions with dummy API key
**Error**: `401 Incorrect API key provided: dummy_key` - All OpenAI API calls failing with authentication errors
**Root Cause**: Using placeholder "dummy_key" for OpenAI API key in development environment, causing all AI-powered suggestion endpoints to fail

**Solution**: 
1. **Graceful fallback handling**: Implemented static fallbacks when OpenAI API fails
2. **Error logging**: Added proper error logging for API failures
3. **Development environment**: Use dummy key but handle failures gracefully

```typescript
// Added fallback handling
try {
  suggestions = await openaiService.suggestChefs(query, context);
} catch (error) {
  console.log('AI suggestions failed, using static fallback:', error.message);
  suggestions = STATIC_CHEF_SUGGESTIONS.filter(chef => 
    chef.toLowerCase().includes(query.toLowerCase())
  );
}
```

**Prevention**: 
- **Environment-specific API keys**: Use real keys in staging/production, dummy in development
- **Graceful degradation**: Always provide fallbacks for external API dependencies
- **Clear error messages**: Log API failures clearly for debugging
- **Mock services**: Consider using mock services for development testing
- **API key validation**: Validate API keys at startup and warn if using dummy keys
**Related**: [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

---

## Error: Registration Preferences Feature Parity Implementation
**Date**: 2025-07-05
**Context**: User requested that registration preferences match the full preferences page in terms of features and AI suggestions
**Challenge**: Registration preferences were significantly lighter than the full preferences page:
- Registration had only 3 basic sections vs 5 comprehensive tabs
- Missing AI suggestions (static TagSelector only vs DynamicSuggestionInput)
- Missing fields: dishes, spice tolerance, chefs, restaurants, nutritional goals, equipment, etc.
- Different styling (`.card` vs `.preference-card`)

**Solution**: Complete overhaul of registration preferences component:
1. **Added Missing Sections**:
   - Spice tolerance selector with visual indicators (Mild/Medium/Hot/Extreme)
   - Favorite dishes with AI suggestions using DynamicSuggestionInput
   - Culinary inspirations (chefs and restaurants) with AI suggestions

2. **AI Suggestion Integration**:
   - Imported and implemented DynamicSuggestionInput component
   - Added AI-powered suggestions for dishes, chefs, restaurants
   - Same suggestion system as full preferences page with proper error handling

3. **Styling Consistency**:
   - Changed from `.card` to `.preference-card` class for consistent styling
   - Improved section organization with clear headers and grid layouts
   - Visual spice tolerance indicators matching main preferences

4. **Backend Constants**:
   - Added `POPULAR_DISHES`, `POPULAR_CHEFS`, `POPULAR_RESTAURANTS` constants
   - Updated `PreferencesFormData` initialization with all required fields
   - Ensured all suggestion endpoints work with proper fallbacks

**Learning**: 
- **Feature parity requires comprehensive analysis** - don't just copy UI, understand functionality
- **AI integration needs proper fallbacks** - static suggestions when AI fails
- **Component reusability** - DynamicSuggestionInput worked perfectly across contexts
- **Styling consistency** - use same CSS classes for similar components
- **Data initialization** - ensure all form fields have proper default values
- **User experience continuity** - registration should feel like a preview of the full app

**Prevention**:
- **Design system documentation** - maintain clear component usage guidelines
- **Feature comparison matrix** - document what each page/component should include
- **Reusable component library** - build components that work across contexts
- **Consistent data models** - ensure same data structures across registration and preferences
- **User journey mapping** - understand how features connect across the app

---

## Error: Google Gemini API Model Deprecation
**Date**: 2025-07-05
**Context**: Switching from OpenAI to Google Gemini for AI suggestions
**Error**: `404 error` when using `gemini-pro` model name - model was deprecated
**Root Cause**: Using outdated model name `gemini-pro` instead of current `gemini-1.5-flash`

**Solution**: 
1. **Updated model name**: Changed from `gemini-pro` to `gemini-1.5-flash`
2. **API testing**: Verified new model works with test requests
3. **Documentation check**: Confirmed current model names in Gemini documentation

**Learning**: 
- **Stay updated with AI model names** - providers frequently update/deprecate models
- **Test API integration thoroughly** - don't assume model names remain stable
- **Check official documentation** - model names and capabilities change regularly
- **Error handling for model changes** - implement fallbacks for deprecated models

**Prevention**:
- **Regular API documentation review** - check for model updates monthly
- **Environment-specific model configuration** - use config files for easy updates
- **API response monitoring** - log and alert on model deprecation warnings
- **Fallback model configuration** - have backup models ready for quick switching

---

## Error: Comprehensive Database Schema Implementation
**Date**: 2025-07-05
**Context**: Implementing comprehensive user preferences with all fields from design
**Challenge**: Database schema needed extensive updates for new preference fields:
- Nutritional goals, budget preferences, meal types
- Available equipment, meal complexity
- Comprehensive validation and storage

**Solution**: 
1. **Prisma Schema Updates**: Added all new fields to UserPreferences model
2. **Database Migration**: Created and ran migrations for new schema
3. **TypeScript Interface Updates**: Updated all interfaces to match new schema
4. **Validation Updates**: Added validation for all new preference fields
5. **API Endpoint Updates**: Updated all CRUD operations to handle new fields

**Learning**: 
- **Schema evolution planning** - plan for comprehensive features from the start
- **Migration strategy** - test migrations thoroughly before applying to production
- **Type safety maintenance** - keep TypeScript interfaces in sync with database schema
- **Validation consistency** - ensure frontend and backend validation match
- **API versioning consideration** - major schema changes may need API versioning

**Prevention**:
- **Comprehensive initial design** - plan for full feature set early
- **Schema documentation** - maintain clear documentation of all fields and their purposes
- **Migration testing** - test migrations on copies of production data
- **Type generation automation** - use tools to auto-generate types from schema
- **Gradual rollout** - implement complex schema changes incrementally when possible

---

## Error: Complex Component State Management with AI Suggestions
**Date**: 2025-07-05
**Context**: DynamicSuggestionInput component managing complex state with AI suggestions, loading states, and fallbacks
**Challenge**: Managing multiple states simultaneously:
- User input and debouncing
- AI suggestion loading states
- Error handling and fallback suggestions
- Selected items and dropdown visibility
- Component reusability across different contexts

**Solution**: 
1. **State Consolidation**: Used useReducer for complex state management
2. **Debouncing**: Implemented proper debouncing for AI suggestion requests
3. **Error Boundaries**: Added comprehensive error handling for AI failures
4. **Loading States**: Clear visual feedback during AI suggestion loading
5. **Context Awareness**: Component adapts to different suggestion types (chefs, restaurants, dishes)

**Learning**: 
- **Complex state needs useReducer** - useState becomes unwieldy with multiple related states
- **Debouncing is essential** - prevent excessive API calls during typing
- **Error handling at component level** - handle AI failures gracefully within components
- **Loading states improve UX** - users need feedback during async operations
- **Component flexibility** - design components to work in multiple contexts

**Prevention**:
- **State management planning** - design state structure before implementing complex components
- **Performance considerations** - implement debouncing and memoization from the start
- **Error handling strategy** - plan for all failure modes in async components
- **Component API design** - design props interface for maximum reusability
- **Testing with real data** - test components with actual API responses and failures

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There are no famous chefs whose names contain 'Alison Roman' or who are known for an 'Alison Roman cuisine'. Alison Roman is a specific chef with her own style, not a type of cuisine."
**Root Cause**: The AI prompt in `GeminiService.suggestChefs` was poorly constructed, asking for chefs "whose names contain '{query}' OR who are known for {query} cuisine". This caused the AI to treat chef names as potential cuisine types, leading to confusion when the query was already a chef name.

**Problematic Prompt**:
```typescript
const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine.`;
```

**Solution**: Rewrote the prompt to be more contextually aware and distinguish between chef names and cuisine types:
```typescript
const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
If the query looks like a chef name, include that chef and similar chefs.
If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
Return only their names, one per line, no descriptions or extra text.`;
```

**Prevention**: 
- **Design AI prompts to be context-aware** - distinguish between different types of user input
- **Avoid ambiguous OR conditions** in AI prompts that could lead to misinterpretation
- **Test AI integrations with various input types** including edge cases
- **Use clear, specific language** in prompts to prevent AI confusion
- **Consider the semantic meaning** of user queries before constructing prompts
- **Implement fallback logic** for when AI responses don't make sense
- **Review and iterate on AI prompts** based on real-world usage patterns
- **Document AI prompt reasoning** for future maintenance

**Related**: 
- [OpenAI Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 🧠 Learning Categories

### Git & Version Control
- Multi-line commit message formatting issues

### TypeScript & React
- React Hook context errors during Hot Module Reloading (HMR fallback handling)
- TagSelector infinite loop prevention with useMemo and proper dependency arrays
- React key uniqueness in reusable components
- Defensive programming for undefined props
- TypeScript compilation errors (unused imports, missing properties, unused parameters)

### Backend Development
- Rate limiting configuration for development vs production environments
- TypeScript unused import/parameter warnings
- Backend/frontend data format consistency (enum vs human-readable)
- Port conflicts and process management (EADDRINUSE errors)
- OpenAI API key authentication and fallback handling
- Environment variable configuration

### Database & Prisma
- Database schema synchronization with application code
- Prisma migration workflow during development
- Database state verification with Prisma Studio

### API Integration
- Authentication header ordering in request configuration (object spread precedence)
- Rate limiting impact on user experience and testing
- Enum value conversion between backend and frontend
- External API failure handling and static fallbacks

### Frontend Development
- Vite build configuration and deprecation warnings
- Package.json module type specification
- Development server port management
- Build tool performance optimization

### Development Environment
- Process cleanup and port management
- Environment variable setup and validation
- Development workflow optimization
- Error handling and graceful degradation

### Deployment & DevOps
- (To be populated as we encounter issues)

---

## 🔄 Review Schedule
- **Weekly**: Review recent errors and update prevention strategies
- **Monthly**: Analyze patterns and update development rules
- **Per Phase**: Document major learnings at phase completion

---

## 💡 Quick Reference - Common Solutions

### Development Environment
- Always check node version compatibility
- Clear npm cache if packages fail to install
- Restart development servers after major changes

### Git Best Practices
- Use single-line commit messages with `-m` flag
- Always test features before committing
- Push regularly to avoid losing work

### Debugging Strategies
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use step-by-step debugging rather than guessing
- Document the debugging process for future reference

### React Component Best Practices
- Always provide default values for props that might be undefined
- Use useMemo for computed arrays to prevent infinite re-renders
- Implement unique component IDs for reusable components
- Add comprehensive error boundaries for graceful degradation
- Test components in isolation and with real API data

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: AI Prompt Engineering for Chef Suggestions - Treating Chef Names as Cuisine Types
**Date**: 2025-01-27
**Context**: AI integration for chef suggestions was responding incorrectly to chef names like "Alison Roman"
**Error**: When users searched for "Alison Roman", the AI responded with "There