# Lessons Learned - Restaurant Recipe Finder

## 📚 Project Knowledge Base
This file documents errors, issues, and learnings encountered during development to prevent recurring problems and build institutional knowledge.

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
