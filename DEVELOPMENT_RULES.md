# Development Rules - Restaurant Recipe Finder

## 🎯 **Core Development Principles**

### 1. **User Experience First**
- Every feature must enhance the user's culinary journey
- Prioritize simplicity and elegance over complexity
- Test all features from a user's perspective before marking complete

### 2. **Data Quality & Accuracy**
- All recipe data must be accurate and tested
- Nutritional information should be realistic and helpful
- API integrations must handle errors gracefully

### 3. **Performance & Scalability**
- Keep API calls efficient and cached when possible
- Optimize database queries for user preferences
- Design for growth from day one

---

## 📝 **Text Style & Capitalization Rules**

### **Core Philosophy**: Lowercase Aesthetic with Strategic Exceptions

**General Rule**: Use lowercase for all text except specific exceptions listed below.

### **✅ Always Capitalize**:

1. **Proper Nouns & Names**:
   - Brand name: `flambé` (always lowercase, even at sentence start)
   - People names: `Thomas Keller`, `René Redzepi`, `Gordon Ramsay`
   - Restaurant names: `The French Laundry`, `Noma`, `Osteria Francescana`
   - Place names: `New York`, `San Francisco`, `Italy`, `Japan`
   - Company names: `Google Places API`, `OpenAI`, `Wikidata`

2. **Technical Terms & Acronyms**:
   - `AI` (never "ai")
   - `API` (never "api") 
   - `JSON`, `HTTP`, `CSS`, `HTML`, `TypeScript`
   - `PostgreSQL`, `Prisma ORM`

3. **Food & Cuisine Proper Nouns**:
   - Cuisine types: `Italian`, `Mexican`, `Chinese`, `Japanese`, `French`
   - Specific dishes with proper names: `Coq au Vin`, `Pad Thai`, `Beef Wellington`
   - Wine regions: `Bordeaux`, `Tuscany`, `Napa Valley`

4. **First Word of Sentences**:
   - Always capitalize the first word of any sentence, even if it would normally be lowercase

### **❌ Keep Lowercase**:

1. **Interface Elements**:
   - Navigation: `dashboard`, `generate recipe`, `my recipes`, `preferences`
   - Buttons: `get started`, `create account`, `save preferences`, `logout`
   - Form labels: `email address`, `dietary restrictions`, `cooking skill level`
   - Page titles: `ai recipe generator`, `preferences`, `welcome back`
   - Section headers: `dietary & health`, `taste & cuisine`, `cooking style`

2. **Generic Food Terms**:
   - Common ingredients: `garlic`, `tomatoes`, `olive oil`, `basil`
   - Generic dishes: `pizza`, `pasta`, `salad`, `soup` (unless part of proper name)
   - Cooking methods: `grilling`, `roasting`, `sautéing`, `steaming`

3. **Descriptive Text**:
   - All body text, descriptions, and explanations
   - Placeholder text in forms
   - Help text and instructions
   - Error messages and notifications

### **🔄 Context-Dependent**:

1. **Titles & Headings**:
   - Page titles: lowercase (`ai recipe generator`, `my preferences`)
   - Section headings: lowercase (`what are you in the mood for?`)
   - Card titles: lowercase (`recipe generator`, `quick actions`)

2. **Menu Items**:
   - Navigation links: lowercase (`dashboard`, `generate recipe`)
   - Dropdown options: lowercase except proper nouns

### **📋 Examples**:

**✅ Correct**:
```
- "ai recipe generator"
- "Generate Recipe" (button)
- "dietary restrictions"
- "Italian cuisine" 
- "Thomas Keller recipes"
- "Google Places API integration"
- "create personalized recipes with AI magic"
```

**❌ Incorrect**:
```
- "AI Recipe Generator" (should be lowercase)
- "Generate recipe" (button should be capitalized)
- "Dietary Restrictions" (should be lowercase)
- "italian cuisine" (cuisine should be capitalized)
- "thomas keller recipes" (name should be capitalized)
- "google places api integration" (proper nouns should be capitalized)
```

---

## 🛠 **Technical Guidelines**

### 4. **API Integration Standards**
- Always handle rate limits gracefully
- Implement proper error handling for all external APIs
- Cache responses when appropriate to reduce API calls
- Use environment variables for all API keys

### 5. **Database Best Practices**
- Use descriptive field names that match user mental models
- Implement proper indexing for performance
- Always validate data before database operations
- Use transactions for multi-step operations

### 6. **Frontend Development**
- Follow the flambé design system consistently
- Use TypeScript for all new code
- Implement proper loading states for all async operations
- Ensure all forms have proper validation and error handling

### 7. **Testing Requirements**
- Test all user flows manually before deployment
- Validate API integrations with real data
- Test edge cases and error scenarios
- Verify responsive design on multiple screen sizes

---

## 🚨 **Critical Rules**

### 8. **Never Break These**
- Never commit API keys or sensitive data
- Always test user registration and login flows
- Verify all database migrations work correctly
- Test all preference changes are saved properly

### 9. **Code Quality**
- Write clear, descriptive commit messages
- Comment complex business logic
- Use consistent naming conventions
- Keep functions focused and single-purpose

### 10. **User Data Protection**
- Hash all passwords properly
- Validate all user inputs
- Sanitize data before database storage
- Respect user privacy in all features

---

## 📊 **Performance Targets**
- Page load times under 2 seconds
- API response times under 500ms
- Database queries optimized for sub-100ms response
- Recipe generation under 10 seconds

## 🎨 **Design Consistency**
- Follow the Nordic/Scandinavian aesthetic
- Use the flambé color palette consistently
- Maintain the minimalist, elegant feel
- Ensure all interactions feel smooth and natural

## 🎭 Communication & Role-Playing Guidelines

### Clarification & Option Presentation (MANDATORY)

#### Vague Prompt Clarification Protocol
**When a prompt is unclear or could have multiple interpretations:**

1. **PAUSE** - Do not proceed immediately
2. **ANALYZE** - Identify the ambiguity or uncertainty
3. **GENERATE** - Create exactly 3 possible interpretations
4. **PRESENT** - Ask the user to choose before proceeding
5. **CONFIRM** - Restate the chosen interpretation for final confirmation

#### Clarification Request Format
```
I want to make sure I understand correctly. Your request could mean:

**Option 1**: [First interpretation with specific details]
**Option 2**: [Second interpretation with specific details]  
**Option 3**: [Third interpretation with specific details]

Which interpretation matches what you're looking for? Or if none of these are quite right, please clarify what you meant.
```

#### When to Ask for Clarification
**ALWAYS ask when:**
- The request uses vague terms like "improve", "fix", "update", "make better"
- Multiple features or components could be affected
- The scope is unclear (entire system vs. specific component)
- The approach isn't specified (UI change vs. backend logic vs. both)
- The priority or urgency isn't clear
- Requirements conflict with existing functionality
- The request could be interpreted as different types of changes

#### Uncertainty Decision Framework
**When you're unsure about the best approach:**

1. **ACKNOWLEDGE** - "I can see a few different ways to approach this"
2. **PRESENT OPTIONS** - Offer exactly 3 concrete approaches
3. **EXPLAIN TRADE-OFFS** - Briefly explain pros/cons of each option
4. **RECOMMEND** - State which option you'd recommend and why
5. **SEEK APPROVAL** - Ask for the user's preference before proceeding

#### Option Presentation Template
```
I can see a few different approaches for this:

**Option A**: [Approach 1]
- Pros: [Benefits]
- Cons: [Drawbacks]
- Time: [Estimated effort]

**Option B**: [Approach 2]
- Pros: [Benefits]
- Cons: [Drawbacks]
- Time: [Estimated effort]

**Option C**: [Approach 3]
- Pros: [Benefits]
- Cons: [Drawbacks]
- Time: [Estimated effort]

**My Recommendation**: Option [X] because [reasoning]

Which approach would you prefer?
```

#### Examples of Vague Prompts Requiring Clarification

**Example 1**: "Make the app better"
```
I want to make sure I understand what you mean by "better". This could mean:

**Option 1**: Improve the user interface and visual design
**Option 2**: Add new features or functionality
**Option 3**: Optimize performance and loading speeds

Which type of improvement are you looking for?
```

**Example 2**: "Fix the authentication"
```
I need to clarify what authentication issue you're referring to:

**Option 1**: Fix a bug in the login/registration process
**Option 2**: Improve the authentication security or token handling
**Option 3**: Add new authentication features (password reset, 2FA, etc.)

Which authentication aspect needs attention?
```

**Example 3**: "Update the database"
```
"Update the database" could mean several things:

**Option 1**: Add new tables or columns for upcoming features
**Option 2**: Modify existing data or fix data inconsistencies
**Option 3**: Update database configuration or migration scripts

What type of database update do you need?
```

#### Mandatory Clarification Scenarios
- **Scope Ambiguity**: "entire app" vs. "specific feature"
- **Technical Approach**: "frontend" vs. "backend" vs. "both"
- **Priority Level**: "quick fix" vs. "comprehensive solution"
- **User Impact**: "internal change" vs. "user-facing feature"
- **Integration Scope**: "standalone" vs. "integrated with existing features"

### Critical Thinking & Collaborative Decision-Making (MANDATORY)

#### Professional Discourse Principles
- **Equal Partnership**: Treat each other as equals regardless of roles
- **Question Everything**: Challenge ideas respectfully when they don't make sense
- **Offer Alternatives**: Don't just point out problems - suggest solutions
- **Seek Clarification**: Ask "why" and "what if" questions to understand context
- **Think Long-Term**: Consider implications beyond immediate implementation
- **Be Intellectually Honest**: Admit when you don't know something or need to research

#### When to Challenge Ideas
**ALWAYS challenge when:**
- Something seems technically infeasible or overly complex
- A suggestion could introduce security vulnerabilities
- The approach conflicts with established best practices
- There's a simpler or more efficient alternative
- The timeline seems unrealistic
- Requirements are unclear or contradictory
- The solution doesn't match the actual problem

#### How to Challenge Constructively
```
❌ BAD: "That won't work."
✅ GOOD: "I see some potential issues with this approach. Here's what I'm thinking... [explain concerns]. What if we tried [alternative] instead?"

❌ BAD: "That's too complicated."
✅ GOOD: "This seems complex for what we're trying to achieve. Could we break it down into smaller pieces? Maybe start with [simpler approach] and iterate?"

❌ BAD: "I don't understand."
✅ GOOD: "I want to make sure I understand the goal here. Are we trying to [restate understanding]? If so, I'm wondering if [alternative approach] might be simpler because [reasoning]."
```

#### Collaborative Ideation Process
1. **Present Ideas Openly**: Share thoughts even if not fully formed
2. **Build on Each Other**: Use "Yes, and..." thinking to expand ideas
3. **Evaluate Together**: Discuss pros/cons of different approaches
4. **Research When Needed**: "Let me look into this and get back to you"
5. **Make Informed Decisions**: Choose based on evidence, not assumptions
6. **Document Reasoning**: Record why we chose one approach over another

#### Decision-Making Framework
For any significant decision:
1. **State the Problem Clearly**: What are we trying to solve?
2. **List Options**: What are our alternatives?
3. **Evaluate Trade-offs**: Pros/cons of each option
4. **Consider Constraints**: Time, resources, technical limitations
5. **Make Decision**: Choose based on evidence and reasoning
6. **Document Choice**: Record decision and reasoning for future reference

#### Research and Validation Guidelines
- **Question Assumptions**: "Are we sure this is the best approach?"
- **Look for Precedents**: "How do other applications solve this problem?"
- **Consider Alternatives**: "What other ways could we achieve this goal?"
- **Validate with Data**: "Let's test this assumption before committing"
- **Seek External Input**: Use documentation, Stack Overflow, GitHub discussions
- **Time-Box Research**: Don't get stuck in analysis paralysis

#### Examples of Good Critical Thinking
- "I'm concerned about using that library - it hasn't been updated in 2 years and has security vulnerabilities. What about [alternative]?"
- "This feature seems complex for what users actually need. Could we start with a simpler version and see how they use it?"
- "I'm not sure this architecture will scale. What if we have 1000 users? Let's think about [alternative approach]."
- "The timeline for this seems aggressive given the complexity. Could we break it into phases?"
- "I don't fully understand the business requirement here. Could you help me understand why users would want this?"

### CEO-CTO Communication Protocol
- **Explain Like I'm Not Technical**: Always provide business-focused explanations for technical decisions
- **Sense-Check Everything**: Before implementing major features, explain the "why" and get approval
- **Progress Updates**: Regular status reports in business terms (features, timeline, risks)
- **Cost-Benefit Analysis**: Explain trade-offs in terms of development time, user experience, and business value
- **Visual Aids**: Use diagrams, tables, and examples to illustrate technical concepts
- **Challenge Respectfully**: Question requirements or suggestions that seem problematic

### Technical Decision Framework
When making technical choices, always explain:
1. **What** we're building
2. **Why** this approach (business benefits)
3. **How long** it will take
4. **What could go wrong** (risks)
5. **Alternative options** and their trade-offs
6. **Why we rejected other options** (reasoning)

### Documentation Style
- Use business language first, technical details second
- Include "Executive Summary" sections for complex topics
- Provide analogies and real-world examples
- Focus on user experience and business outcomes
- Document decision-making process and alternatives considered

## 🎯 Project Rules

### Target User Profile & Experience Guidelines

#### User Demographics
- **Primary Users**: Well-travelled and tasteful foodies with discerning palates
- **Experience Level**: Sophisticated culinary enthusiasts who appreciate fine dining and authentic cuisine
- **Travel Background**: Extensive travel experience with exposure to diverse global cuisines
- **Culinary Knowledge**: Deep appreciation for quality ingredients, proper techniques, and authentic flavors
- **Primary Goal**: Discover elevated recipes and culinary experiences that match their refined tastes

#### Content Quality Standards
**Chef Recommendations**:
- Focus on renowned, Michelin-starred, and critically acclaimed chefs
- Emphasize culinary innovators and masters of their craft (e.g., Thomas Keller, Daniel Boulud, Alice Waters)
- Avoid mainstream TV personalities and celebrity chefs without serious culinary credentials
- Include influential historical figures (Julia Child, Anthony Bourdain) and respected contemporary chefs

**Restaurant Suggestions**:
- Emphasize fine dining establishments and award-winning restaurants
- Include authentic local gems and hidden culinary treasures
- Focus on restaurants with critical acclaim, Michelin stars, or James Beard recognition
- Avoid chain restaurants and mainstream casual dining establishments

**Recipe Quality**:
- Prioritize authentic, traditional recipes with proper techniques
- Include sophisticated flavor profiles and quality ingredients
- Provide context about regional origins and cultural significance
- Avoid oversimplified or "dumbed-down" versions of classic dishes

**Ingredient Standards**:
- Emphasize quality, seasonal, and authentic ingredients
- Include specialty and artisanal products when appropriate
- Provide guidance on sourcing quality ingredients
- Respect traditional ingredient usage and combinations

#### Communication Tone
- Respectful of culinary traditions and authenticity
- Knowledgeable without being pretentious
- Assumes users have sophisticated palates and culinary curiosity
- Provides context and education about techniques and origins

### 0. User Testing & Approval (MANDATORY - HIGHEST PRIORITY)

#### Feature Completion Workflow
**CRITICAL RULE**: NO new features can be started until the current feature has been tested and approved by the user.

**Mandatory Steps for Every Feature:**
1. **Complete Implementation** - Finish all code for the feature
2. **STOP DEVELOPMENT** - Do not proceed to next feature
3. **Request User Testing** - Explicitly ask user to test the feature
4. **Provide Testing Instructions** - Give clear steps on how to test
5. **Wait for Approval** - Do not continue until user confirms it works
6. **Document Approval** - Record user approval in project plan
7. **Only Then** - Move to next feature

#### Testing Request Template
```
🧪 **FEATURE TESTING REQUIRED**

**Feature Completed**: [Feature Name]
**What to Test**: [Specific functionality]
**How to Test**: 
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]
**Potential Issues**: [What to watch for]

**Please test this feature and let me know:**
- ✅ Does it work as expected?
- 🐛 Any bugs or issues?
- 💡 Any improvements needed?
- 🚀 Ready to move to next feature?

**I will not proceed to the next feature until you approve this one.**
```

#### Current Status Check
**BEFORE starting any new work:**
- Check what features are pending user testing
- Remind user of untested features
- Do not start new features if any are awaiting approval

#### User Approval Documentation
When user approves a feature:
- Update PROJECT_PLAN.md with ✅ **USER APPROVED** status
- Mark feature as 100% complete only after user approval
- Document any user feedback or requested changes
- Record approval date and time

#### Violation Consequences
**If this rule is violated:**
- Immediately stop all development
- Return to the pending feature
- Request user testing before proceeding
- Update documentation to reflect the correct status

#### Examples of Proper Testing Requests

**Example 1**: User Preferences Feature
```
🧪 **USER PREFERENCES TESTING REQUIRED**

**Feature Completed**: User Preferences Management System
**What to Test**: Complete preferences management functionality

**How to Test**:
1. Log into the application
2. Navigate to the Preferences page
3. Try updating dietary restrictions
4. Add/remove favorite ingredients
5. Change cooking skill level and time preferences
6. Save changes and verify they persist

**Expected Behavior**: All preferences should save and load correctly
**Potential Issues**: Form validation, data persistence, UI responsiveness

**Please test this feature and confirm it works before I move to Phase 3 (AI Integration).**
```

**Example 2**: Recipe Generation Feature
```
🧪 **RECIPE GENERATION TESTING REQUIRED**

**Feature Completed**: AI Recipe Generation System
**What to Test**: Generate personalized recipes with AI

**How to Test**:
1. Navigate to Recipe Generator
2. Enter inspiration (restaurant, chef, cuisine, or city)
3. Add any additional requests
4. Generate recipe
5. Try saving the recipe
6. Check if preferences are reflected in the recipe

**Expected Behavior**: AI generates relevant, personalized recipes
**Potential Issues**: API errors, long generation times, recipe quality

**Please test this feature thoroughly before I continue with recipe management features.**
```

#### Feature Handoff Checklist
Before requesting user testing:
- [ ] Feature is fully implemented
- [ ] No known bugs or issues
- [ ] Basic functionality tested by developer
- [ ] Clear testing instructions prepared
- [ ] Expected behavior documented
- [ ] Potential issues identified
- [ ] Ready for user feedback

#### User Testing Priorities
**High Priority Testing** (must be approved before next feature):
- Core functionality changes
- New user-facing features
- Database schema changes
- Authentication/security updates
- API endpoint changes

**Medium Priority Testing** (can be tested in batches):
- UI/UX improvements
- Performance optimizations
- Bug fixes
- Documentation updates

**Testing Batching**
- Related small features can be tested together
- Maximum 3 features per testing batch
- Each feature must still be individually approved
- Major features always tested individually

### 1. Risk Management & Change Impact Assessment (MANDATORY)

#### Risk Assessment Framework
Before making any code changes, evaluate and communicate:
- **Impact Scope**: What parts of the system will be affected?
- **Breaking Change Risk**: Could this break existing functionality?
- **Security Risk**: Does this introduce vulnerabilities?
- **Data Risk**: Could this affect data integrity or cause data loss?
- **Performance Risk**: Will this impact application performance?
- **Confidence Level**: How certain are you this change will work?

#### Risk Levels & Communication
**🟢 LOW RISK** - Minor changes with minimal impact
- Examples: UI text changes, styling updates, adding new optional fields
- Impact: Single component or isolated feature
- Confidence: 95%+ certain it will work
- Communication: Brief description in commit message

**🟡 MEDIUM RISK** - Moderate changes requiring attention
- Examples: New API endpoints, database schema additions, new features
- Impact: Multiple components or new integrations
- Confidence: 80-95% certain, some unknowns
- Communication: Detailed commit message + testing plan

**🔴 HIGH RISK** - Significant changes requiring careful review
- Examples: Authentication changes, database migrations, major refactoring
- Impact: Core system functionality or security
- Confidence: <80% certain, significant unknowns
- Communication: Detailed documentation + rollback plan + extensive testing

#### Risk Communication Template
```markdown
## Change Risk Assessment

**Risk Level**: 🟢/🟡/🔴 [LOW/MEDIUM/HIGH]
**Confidence**: [X%] - [Brief explanation]

**Impact Analysis**:
- **Scope**: [What will be affected]
- **Breaking Changes**: [Yes/No - explanation]
- **Security Impact**: [None/Minor/Significant]
- **Data Impact**: [None/Additions/Modifications]
- **Performance Impact**: [None/Minimal/Noticeable]

**Mitigation Strategies**:
- [Strategy 1]
- [Strategy 2]

**Rollback Plan**:
- [How to undo this change if needed]

**Testing Strategy**:
- [Specific tests to verify safety]
```

#### Risk Management Workflow
1. **Before Changes**: Assess risk level and document
2. **During Development**: Monitor for unexpected issues
3. **Before Commit**: Re-evaluate risk based on actual implementation
4. **After Deployment**: Monitor for issues and document outcomes

#### High-Risk Change Requirements
For 🔴 HIGH RISK changes:
- **Backup First**: Ensure database/code backups exist
- **Feature Flags**: Use feature flags when possible
- **Gradual Rollout**: Deploy to staging first, then production
- **Monitoring Plan**: Define what to monitor post-deployment
- **Rollback Plan**: Clear steps to revert if needed
- **Extended Testing**: More comprehensive testing required

#### Project-Specific Risk Examples

**🟢 LOW RISK Examples for Our Recipe Finder:**
- Adding new UI components (buttons, forms)
- Updating text content or styling
- Adding new optional preference fields
- Creating new React pages
- Adding validation messages

**🟡 MEDIUM RISK Examples for Our Recipe Finder:**
- New API endpoints for preferences or recipes
- Adding new database tables or columns
- Integrating with external APIs (OpenAI)
- Authentication middleware changes
- New user features (recipe saving, ratings)

**🔴 HIGH RISK Examples for Our Recipe Finder:**
- Modifying existing authentication system
- Database schema migrations affecting existing data
- Major refactoring of core components
- Changes to JWT token handling
- Modifying existing API endpoints with breaking changes
- Integration with payment systems (future)
- Production deployment configurations

### 2. Project Tracking & Progress Management
- **PROJECT_PLAN.md Updates**: ALWAYS update PROJECT_PLAN.md when completing features
- **Real-Time Progress**: Mark items as complete `[x]` immediately after implementation
- **Phase Tracking**: Update phase completion percentages as we progress
- **Status Reviews**: Check project plan before starting new work to ensure alignment
- **Completion Criteria**: Define clear completion criteria for each feature
- **Documentation Updates**: Update "What's Been Built" section with new accomplishments

#### Project Tracking Workflow:
1. **Before Starting**: 
   - Check PROJECT_PLAN.md to understand current phase and priorities
   - **ASSESS RISK**: Evaluate and document the risk level of planned changes
2. **During Development**: 
   - Use TODO lists to track immediate tasks
   - Monitor for unexpected issues that could increase risk level
3. **During Problem-Solving**: Document any errors or issues in LESSONS_LEARNED.md
4. **After Completion**: 
   - **TEST IMMEDIATELY**: Follow the 7-step testing workflow to verify the feature
   - **RE-ASSESS RISK**: Confirm final risk level based on actual implementation
   - Mark items complete `[x]` in PROJECT_PLAN.md
   - Update phase completion percentages
   - Add accomplishments to "What's Been Built" section
   - Update "Next Steps" if priorities change
   - **COMMIT IMMEDIATELY**: Always commit and push changes after completing a feature
5. **Regular Reviews**: Assess overall project health and adjust timeline as needed

#### Progress Reporting Format:
- **Phase Status**: "Phase X: Y% Complete - [Brief Description]"
- **Recent Accomplishments**: List of completed features with business value
- **Current Focus**: What we're working on now
- **Next Priorities**: What comes next according to the plan
- **Blockers/Risks**: Any issues that could impact timeline

#### Milestone Management:
- **Phase Completion**: Celebrate when completing each phase (update README, commit progress)
- **Feature Demos**: Test major features immediately after implementation
- **Quality Gates**: Never commit untested features - testing is mandatory
- **Progress Commits**: Commit PROJECT_PLAN.md updates with meaningful commit messages
- **Momentum Tracking**: Keep track of development velocity and adjust expectations
- **Success Metrics**: Measure progress against original timeline and scope
- **Testing Documentation**: Include testing results in commit messages and documentation

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

#### When to Commit:
- ✅ **After completing a full feature** (e.g., user preferences page)
- ✅ **After fixing a significant bug** (including authentication, API, database issues)
- ✅ **After adding new API endpoints**
- ✅ **After updating documentation or project plans**
- ✅ **Before switching to a different feature**
- ✅ **At the end of each development session**
- ✅ **IMMEDIATELY after fixing any bug or error** (no exceptions)
- ✅ **IMMEDIATELY after adding/changing development rules** (DEVELOPMENT_RULES.md)
- ✅ **IMMEDIATELY after documenting errors** (LESSONS_LEARNED.md updates)
- ✅ **After any configuration changes** (package.json, tsconfig, etc.)
- ✅ **After any security fixes** (authentication, authorization, validation)

#### MANDATORY IMMEDIATE COMMITS (🚨 CRITICAL)
**These require IMMEDIATE commits without delay:**

1. **Bug Fixes**: Any bug resolution must be committed immediately
   - Authentication/authorization fixes
   - API integration fixes
   - Database query fixes
   - Build/compilation fixes
   - Logic error corrections

2. **Rule Changes**: Any modification to development rules or processes
   - DEVELOPMENT_RULES.md updates
   - New workflow additions
   - Process improvements
   - Best practice updates

3. **Error Documentation**: Updates to lessons learned
   - LESSONS_LEARNED.md entries
   - Error analysis documentation
   - Prevention strategy updates

4. **Security Fixes**: Any security-related changes
   - Authentication improvements
   - Authorization fixes
   - Input validation updates
   - Security vulnerability patches

#### Commit Message Template for Fixes and Rules
```
fix: [Brief description of what was fixed]

Problem: [What was broken or needed improvement]
Solution: [How it was fixed]
Impact: [What this fixes or improves]
Risk: 🟢/🟡/🔴 [Risk level assessment]

[Optional: Reference to LESSONS_LEARNED.md entry]
```

**Example for Bug Fix:**
```
fix: resolve authentication header not being sent in PUT requests

Problem: PUT /api/preferences returning 401 despite valid token
Solution: Fixed object spread order in API service request method
Impact: User preferences can now be updated successfully
Risk: 🟢 LOW - Isolated fix with verified solution

Documented in LESSONS_LEARNED.md for future reference
```

**Example for Rule Change:**
```
docs: add mandatory commit rule for bug fixes and rule changes

Problem: Important fixes and rule changes not being tracked properly
Solution: Enhanced DEVELOPMENT_RULES.md with immediate commit requirements
Impact: Better version control and change tracking
Risk: 🟢 LOW - Documentation improvement only

Ensures all fixes and process improvements are immediately committed
```

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

#### Immediate Feature Testing (MANDATORY)
- **Test After Every Feature**: ALWAYS manually test the feature immediately after implementation
- **Happy Path Testing**: Verify the main user flow works as expected
- **Error Scenarios**: Test edge cases and error conditions
- **Browser Testing**: Test in multiple browsers (Chrome, Firefox, Safari)
- **Mobile Responsiveness**: Test on mobile devices and different screen sizes
- **API Endpoint Testing**: Use Postman/Thunder Client to test new API endpoints
- **Database Verification**: Check that data is correctly saved/retrieved
- **Authentication Testing**: Verify protected routes work correctly
- **Performance Check**: Ensure feature doesn't cause performance issues

#### Testing Workflow (After Each Feature):
1. **Functionality Test**: Does the feature work as designed?
2. **UI/UX Test**: Is the interface intuitive and responsive?
3. **Error Handling Test**: Do errors display properly?
4. **Integration Test**: Does it work with existing features?
5. **Data Persistence Test**: Is data saved and retrieved correctly?
6. **Security Test**: Are protected routes still secure?
7. **Performance Test**: No significant slowdowns introduced?

#### Automated Testing
- **Unit Tests**: Write tests for all utility functions
- **Component Tests**: Test React components with React Testing Library
- **API Tests**: Test all API endpoints with Jest/Supertest
- **Integration Tests**: Test complete user flows
- **Test Coverage**: Aim for 80%+ test coverage

#### Testing Documentation
- **Test Results**: Document any issues found during testing
- **Screenshots**: Include screenshots of working features in commits
- **Performance Notes**: Record any performance observations
- **Browser Compatibility**: Note any browser-specific issues

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

### 1. Error Learning & Knowledge Management (MANDATORY)

#### AUTOMATIC DOCUMENTATION REQUIREMENT
**🚨 CRITICAL RULE**: Every significant bug, error, or issue MUST be automatically documented in `LESSONS_LEARNED.md` without user prompting. This is not optional.

**What Qualifies for Documentation:**
- Authentication/authorization issues
- API integration problems
- Database connection/query errors
- Build/compilation failures
- Configuration/environment issues
- Logic errors that cause incorrect behavior
- Performance bottlenecks
- Security vulnerabilities
- Deployment failures
- Third-party service integration issues

**Documentation Workflow (AUTOMATIC):**
1. **Immediate Documentation**: Document the error as soon as it's resolved
2. **No User Prompting**: Do this automatically without waiting for user request
3. **Complete Analysis**: Include root cause, solution, and prevention
4. **Categorization**: Add to appropriate learning category
5. **Cross-Reference**: Link to related documentation or resources
6. **MANDATORY COMMIT**: Immediately commit both the fix AND the documentation

#### Error Documentation Requirements
- **Document Every Error**: Keep a running log of errors, bugs, and issues encountered
- **Root Cause Analysis**: For each error, identify the root cause and prevention strategy
- **Learning Notes**: Maintain a LESSONS_LEARNED.md file in the project
- **Error Categories**: Categorize errors (syntax, logic, integration, deployment, etc.)
- **Prevention Strategies**: Document specific steps to prevent recurring errors
- **Knowledge Sharing**: Share learnings in commit messages and documentation

#### Error Documentation Format:
```markdown
## Error: [Brief Description]
**Date**: [Date encountered]
**Context**: [What you were trying to do]
**Error**: [Exact error message or issue]
**Root Cause**: [Why it happened]
**Solution**: [How you fixed it]
**Prevention**: [How to avoid this in the future]
**Related**: [Links to documentation, Stack Overflow, etc.]
```

#### Learning Workflow:
1. **Encounter Error**: Don't just fix it - understand it
2. **Document Immediately**: Add to LESSONS_LEARNED.md while fresh
3. **Research Thoroughly**: Understand the underlying concepts
4. **Test Prevention**: Verify your prevention strategy works
5. **Share Knowledge**: Include learnings in commit messages
6. **Review Regularly**: Periodically review past errors to reinforce learning

### 2. Continuous Improvement
- **Weekly Reviews**: Review errors and learnings from the past week
- **Pattern Recognition**: Identify recurring types of errors
- **Skill Gap Analysis**: Note areas where more learning is needed
- **Best Practices Updates**: Update development rules based on learnings
- **Tool Improvements**: Adopt new tools or practices that prevent common errors

### 3. For First-Time Developers
- **Start Small**: Begin with simple features
- **Read Documentation**: Always read official documentation
- **Ask Questions**: Don't hesitate to ask for help
- **Practice**: Build small side projects to practice
- **Learn from Mistakes**: Every error is a learning opportunity

### 4. Code Review Learning
- **Review Others' Code**: Learn from code reviews
- **Accept Feedback**: Be open to constructive criticism
- **Document Learnings**: Keep notes of new concepts learned
- **Error Prevention**: Look for patterns that could cause future errors

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

## 🎨 Design Philosophy
flambé follows a minimalist Nordic/Scandinavian aesthetic with clean lines, muted colors, and thoughtful typography.

## Capitalization System

### Always Capitalize
- **Proper nouns**: Thomas Keller, Italian cuisine, Google Places API
- **Technical acronyms**: AI, API, URL, JSON
- **Company/brand names**: Google, OpenAI, Wikipedia
- **Geographic locations**: San Francisco, Italy, Thailand
- **First word of sentences**: "Fill out the form..."

### Keep Lowercase
- **Interface elements**: buttons, navigation links, form labels, page titles
- **Section headers**: "dietary requirements", "taste preferences"
- **Form placeholders**: "add dietary restrictions..."
- **Status messages**: "preferences saved successfully"
- **Tab labels**: "dietary & health", "cooking style"

### Context-Dependent
- **Buttons**: Capitalize action buttons (Save Changes, Generate Recipe) but keep interface buttons lowercase (modify, reset form)
- **First word of sentences**: Always capitalize regardless of other rules

## Visual Elements

### No Emojis
- **Never use emojis** in the application interface
- Use SVG icons or text-based symbols instead
- Maintain clean, professional aesthetic
- Emojis break the minimalist Nordic design philosophy

### Icons
- Use consistent SVG icons throughout the application
- Prefer simple, clean line-based icons
- Maintain consistent sizing and styling

## Typography
- Use the flambé font system (Nordic-inspired typography)
- Maintain consistent font weights and sizes
- Prioritize readability and clean presentation

## Color Palette
- Stick to the defined flambé color variables
- Use muted, Nordic-inspired colors
- Maintain high contrast for accessibility

## Component Consistency
- Follow established patterns for buttons, forms, and navigation
- Use consistent spacing and layout principles
- Maintain the minimalist aesthetic across all components

## Code Style
- Follow TypeScript best practices
- Use descriptive variable and function names
- Maintain consistent code formatting
- Document complex logic clearly 