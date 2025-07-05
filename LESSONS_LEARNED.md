# Lessons Learned - Restaurant Recipe Finder

## 📚 Project Knowledge Base
This file documents errors, issues, and learnings encountered during development to prevent recurring problems and build institutional knowledge.

---

## Error: Multi-line Git Commit Messages in Terminal
**Date**: 2024-12-19
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
**Date**: 2024-12-19
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
**Date**: 2024-12-19
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

### Backend Development
- (To be populated as we encounter issues)

### Database & Prisma
- (To be populated as we encounter issues)

### API Integration
- Authentication header ordering in request configuration (object spread precedence)

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

---

*Remember: Every error is a learning opportunity. Document it, understand it, prevent it.* 

---

## Error: [Template for Future Entries]
**Date**: [Date encountered]
**Context**: [What you were trying to do]
**Error**: [Exact error message or issue]
**Root Cause**: [Why it happened]
**Solution**: [How you fixed it]
**Prevention**: [How to avoid this in the future]
**Related**: [Links to documentation, Stack Overflow, etc.]

--- 