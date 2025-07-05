# Development Rules & Guidelines

## 🎭 Communication & Role-Playing Guidelines

### CEO-CTO Communication Protocol
- **Explain Like I'm Not Technical**: Always provide business-focused explanations for technical decisions
- **Sense-Check Everything**: Before implementing major features, explain the "why" and get approval
- **Progress Updates**: Regular status reports in business terms (features, timeline, risks)
- **Cost-Benefit Analysis**: Explain trade-offs in terms of development time, user experience, and business value
- **Visual Aids**: Use diagrams, tables, and examples to illustrate technical concepts

### Technical Decision Framework
When making technical choices, always explain:
1. **What** we're building
2. **Why** this approach (business benefits)
3. **How long** it will take
4. **What could go wrong** (risks)
5. **Alternative options** and their trade-offs

### Documentation Style
- Use business language first, technical details second
- Include "Executive Summary" sections for complex topics
- Provide analogies and real-world examples
- Focus on user experience and business outcomes

## 🎯 Project Rules

### 1. Project Tracking & Progress Management
- **PROJECT_PLAN.md Updates**: ALWAYS update PROJECT_PLAN.md when completing features
- **Real-Time Progress**: Mark items as complete `[x]` immediately after implementation
- **Phase Tracking**: Update phase completion percentages as we progress
- **Status Reviews**: Check project plan before starting new work to ensure alignment
- **Completion Criteria**: Define clear completion criteria for each feature
- **Documentation Updates**: Update "What's Been Built" section with new accomplishments

#### Project Tracking Workflow:
1. **Before Starting**: Check PROJECT_PLAN.md to understand current phase and priorities
2. **During Development**: Use TODO lists to track immediate tasks
3. **After Completion**: 
   - Mark items complete `[x]` in PROJECT_PLAN.md
   - Update phase completion percentages
   - Add accomplishments to "What's Been Built" section
   - Update "Next Steps" if priorities change
   - **COMMIT IMMEDIATELY**: Always commit and push changes after completing a feature
4. **Regular Reviews**: Assess overall project health and adjust timeline as needed

#### Progress Reporting Format:
- **Phase Status**: "Phase X: Y% Complete - [Brief Description]"
- **Recent Accomplishments**: List of completed features with business value
- **Current Focus**: What we're working on now
- **Next Priorities**: What comes next according to the plan
- **Blockers/Risks**: Any issues that could impact timeline

#### Milestone Management:
- **Phase Completion**: Celebrate when completing each phase (update README, commit progress)
- **Feature Demos**: Test major features immediately after implementation
- **Progress Commits**: Commit PROJECT_PLAN.md updates with meaningful commit messages
- **Momentum Tracking**: Keep track of development velocity and adjust expectations
- **Success Metrics**: Measure progress against original timeline and scope

#### Project Health Indicators:
- ✅ **Green**: On track, features working as expected, no major blockers
- ⚠️ **Yellow**: Minor delays or issues, but manageable with current resources
- 🔴 **Red**: Major blockers, significant delays, or scope changes needed

#### Commit & Version Control Rules:
- **Feature Completion Commits**: ALWAYS commit immediately after completing any feature
- **Commit Message Format**: Use descriptive commit messages that explain the business value
- **Commit Frequency**: Commit working code frequently, don't wait for perfect completion
- **Push Regularly**: Push to remote repository at least once per session
- **Documentation Updates**: Include PROJECT_PLAN.md updates in the same commit as the feature

#### Commit Message Template:
```
feat: [Feature Name] - [Business Value]

✅ COMPLETED: [What was built]

Implementation Details:
- [Technical detail 1]
- [Technical detail 2]
- [Technical detail 3]

Project Status:
- [Phase X]: [Y%] Complete
- [Next priority or blocker]

[Optional: Screenshots, performance notes, or testing results]
```

#### When to Commit:
- ✅ **After completing a full feature** (e.g., user preferences page)
- ✅ **After fixing a significant bug**
- ✅ **After adding new API endpoints**
- ✅ **After updating documentation or project plans**
- ✅ **Before switching to a different feature**
- ✅ **At the end of each development session**

### 2. Code Organization
- **File Structure**: Follow consistent naming conventions
  - Components: PascalCase (e.g., `RecipeCard.tsx`)
  - Files: kebab-case (e.g., `user-profile.ts`)
  - Folders: kebab-case (e.g., `recipe-components/`)
- **Separation of Concerns**: Keep components, utilities, and API calls separate
- **Module Structure**: One component per file, export from index files

### 2. Coding Standards

#### TypeScript
- **Strict Mode**: Always use strict TypeScript configuration
- **Type Definitions**: Define interfaces for all data structures
- **No Any Types**: Avoid `any` type, use proper typing
- **Optional Properties**: Use `?` for optional properties
- **Union Types**: Use union types for multiple possible values

#### React Best Practices
- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Interface**: Always define props interface
- **Key Props**: Always provide unique keys for list items
- **Event Handlers**: Use proper event typing

#### JavaScript/Node.js
- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Always handle errors properly
- **Environment Variables**: Use environment variables for configuration

### 3. Database Rules
- **Migrations**: Always use migrations for schema changes
- **Indexing**: Add indexes for frequently queried columns
- **Relationships**: Define proper foreign key relationships
- **Data Validation**: Validate data at both frontend and backend
- **Backup Strategy**: Regular database backups

### 4. API Design Rules
- **RESTful**: Follow REST conventions
- **Status Codes**: Use appropriate HTTP status codes
- **Error Responses**: Consistent error response format
- **Rate Limiting**: Implement rate limiting for all endpoints
- **Authentication**: Secure all protected endpoints
- **Validation**: Validate all input data

### 5. Security Rules
- **Authentication**: JWT tokens with proper expiration
- **Password Hashing**: Use bcrypt for password hashing
- **Input Sanitization**: Sanitize all user inputs
- **CORS**: Configure CORS properly
- **Environment Variables**: Never commit secrets to version control
- **API Keys**: Rotate API keys regularly

### 6. Testing Rules
- **Unit Tests**: Write tests for all utility functions
- **Component Tests**: Test React components
- **API Tests**: Test all API endpoints
- **Integration Tests**: Test complete user flows
- **Test Coverage**: Aim for 80%+ test coverage

### 7. Performance Rules
- **Lazy Loading**: Implement lazy loading for routes
- **Image Optimization**: Optimize images and use proper formats
- **Bundle Size**: Keep bundle size minimal
- **Caching**: Implement proper caching strategies
- **Database Queries**: Optimize database queries

### 8. UI/UX Rules
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Follow WCAG guidelines
- **Loading States**: Show loading states for async operations
- **Error States**: Provide clear error messages
- **Consistent Design**: Use design system consistently

## 🚀 Development Workflow

### 1. Git Workflow
- **Branch Naming**: `feature/feature-name` or `fix/bug-description`
- **Commit Messages**: Use conventional commit format with business value explanation
- **Immediate Commits**: Commit and push after every completed feature
- **Pull Requests**: Require code review before merging (for team environments)
- **Main Branch**: Keep main branch always deployable
- **Commit Frequency**: Multiple commits per session, never lose work
- **Documentation Sync**: Always commit PROJECT_PLAN.md updates with related features

### 2. Code Review Process
- **Self Review**: Review your own code before submitting
- **Peer Review**: Have another developer review your code
- **Automated Checks**: Pass all linting and testing checks
- **Documentation**: Update documentation as needed

### 3. Deployment Rules
- **Environment Separation**: Separate dev, staging, and production
- **Database Migrations**: Run migrations before deployment
- **Rollback Plan**: Have rollback strategy ready
- **Monitoring**: Monitor application after deployment

## 📝 Documentation Rules

### 1. Code Documentation
- **JSDoc**: Document all functions and classes
- **README**: Keep README updated
- **API Documentation**: Document all API endpoints
- **Setup Instructions**: Clear setup and installation guide

### 2. Comment Guidelines
- **Why, Not What**: Comment on why, not what the code does
- **Complex Logic**: Comment complex business logic
- **TODOs**: Use TODO comments for future improvements
- **Deprecated Code**: Mark deprecated code clearly

## 🔧 Tool Configuration

### 1. Linting & Formatting
- **ESLint**: Use ESLint for JavaScript/TypeScript
- **Prettier**: Use Prettier for code formatting
- **Husky**: Pre-commit hooks for code quality
- **EditorConfig**: Consistent editor settings

### 2. Build Tools
- **Webpack/Vite**: Modern build tools
- **Babel**: Transpile modern JavaScript
- **PostCSS**: Process CSS with modern features

## 🎨 Design System Rules

### 1. Color Palette
- **Primary Colors**: Consistent brand colors
- **Semantic Colors**: Use colors for meaning (success, error, warning)
- **Accessibility**: Ensure sufficient color contrast

### 2. Typography
- **Font Hierarchy**: Consistent heading and body text
- **Readability**: Ensure text is readable on all devices
- **Font Loading**: Optimize font loading

### 3. Spacing
- **Consistent Spacing**: Use design system spacing scale
- **Responsive Spacing**: Adjust spacing for different screen sizes

## 🚨 Error Handling Rules

### 1. Frontend Errors
- **User-Friendly Messages**: Show user-friendly error messages
- **Error Boundaries**: Use React error boundaries
- **Logging**: Log errors for debugging

### 2. Backend Errors
- **Proper Status Codes**: Return appropriate HTTP status codes
- **Error Logging**: Log errors with context
- **Graceful Degradation**: Handle errors gracefully

## 📊 Monitoring Rules

### 1. Application Monitoring
- **Performance Metrics**: Monitor load times and response times
- **Error Tracking**: Track and alert on errors
- **User Analytics**: Track user behavior (with privacy in mind)

### 2. Infrastructure Monitoring
- **Server Health**: Monitor server resources
- **Database Performance**: Monitor database performance
- **API Usage**: Monitor API usage and limits

## 🔄 Maintenance Rules

### 1. Dependency Management
- **Regular Updates**: Keep dependencies updated
- **Security Audits**: Regular security audits
- **Breaking Changes**: Test thoroughly before major updates

### 2. Code Cleanup
- **Technical Debt**: Address technical debt regularly
- **Unused Code**: Remove unused code and dependencies
- **Performance Optimization**: Regular performance reviews

## 📚 Learning Guidelines

### 1. For First-Time Developers
- **Start Small**: Begin with simple features
- **Read Documentation**: Always read official documentation
- **Ask Questions**: Don't hesitate to ask for help
- **Practice**: Build small side projects to practice

### 2. Code Review Learning
- **Review Others' Code**: Learn from code reviews
- **Accept Feedback**: Be open to constructive criticism
- **Document Learnings**: Keep notes of new concepts learned

## 🎯 Success Metrics

### 1. Code Quality
- **Test Coverage**: Maintain high test coverage
- **Linting Score**: Pass all linting rules
- **Performance**: Meet performance benchmarks

### 2. User Experience
- **Load Times**: Fast page load times
- **Error Rate**: Low error rates
- **User Satisfaction**: Positive user feedback

Remember: These rules are guidelines to help you build a better application. They should be followed but can be adapted as the project evolves and you learn more about best practices. 