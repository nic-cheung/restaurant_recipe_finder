# User Authentication Flow

## Visual Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Visits   │    │   Registration  │    │   Login Page    │
│   Landing Page  │    │     Page        │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Choose Action  │    │  Fill Form:     │    │  Fill Form:     │
│                 │    │  - Email        │    │  - Email        │
│  [Register]     │───▶│  - Password     │    │  - Password     │
│  [Login]        │    │  - Name         │    │                 │
└─────────────────┘    │  - Preferences  │    └─────────┬───────┘
                       └─────────┬───────┘              │
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Backend API    │    │  Backend API    │
                       │  POST /auth/    │    │  POST /auth/    │
                       │  register       │    │  login          │
                       └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Validation &   │    │  Validation &   │
                       │  Password Hash  │    │  Password Check │
                       └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Create User    │    │  Generate JWT   │
                       │  in Database    │    │  Token          │
                       └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Return JWT     │    │  Return JWT     │
                       │  Token + User   │    │  Token + User   │
                       │  Data           │    │  Data           │
                       └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Store Token    │    │  Store Token    │
                       │  in Browser     │    │  in Browser     │
                       │  (localStorage) │    │  (localStorage) │
                       └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Redirect to    │    │  Redirect to    │
                       │  Dashboard      │    │  Dashboard      │
                       └─────────────────┘    └─────────────────┘
```

## Protected Routes Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Tries to  │    │  Check JWT      │    │  JWT Valid?     │
│  Access         │    │  Token in       │    │                 │
│  Protected Page │    │  localStorage   │    │  [Yes] [No]     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Send Token     │    │  Redirect to    │
│  Router Guard   │    │  with Request   │    │  Login Page     │
└─────────┬───────┘    └─────────┬───────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Backend        │    │  Verify Token   │
│  Middleware     │    │  & Extract User │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Token Valid?   │    │  Add User to    │
│                 │    │  Request Object │
│  [Yes] [No]     │    └─────────┬───────┘
└─────────┬───────┘              │
          │                      ▼
          ▼              ┌─────────────────┐
┌─────────────────┐      │  Allow Access   │
│  Return 401     │      │  to Protected   │
│  Unauthorized   │      │  Route          │
└─────────────────┘      └─────────────────┘
```

## Password Reset Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Clicks    │    │  Enter Email    │    │  Backend API    │
│  "Forgot        │    │  Address        │    │  POST /password-│
│  Password?"     │    │                 │    │  reset/forgot   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Navigate to    │    │  Form           │    │  Validate Email │
│  ForgotPassword │    │  Validation     │    │  & Check User   │
│  Page           │    │                 │    │  Exists         │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Fills     │    │  Submit Form    │    │  Generate JWT   │
│  Email Field    │    │  to Backend     │    │  Reset Token    │
└─────────────────┘    └─────────────────┘    │  (1hr expiry)   │
                                              └─────────┬───────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Send Email     │
                                              │  with Reset     │
                                              │  Link + Token   │
                                              └─────────┬───────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Show Success   │
                                              │  Message        │
                                              └─────────────────┘
```

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Clicks    │    │  Token Valid?   │    │  Show Error     │
│  Email Reset    │    │                 │    │  Page - Invalid │
│  Link           │    │  [Yes] [No]     │    │  or Expired     │
└─────────┬───────┘    └─────────┬───────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Navigate to    │    │  Show Reset     │
│  ResetPassword  │    │  Password Form  │
│  Page with      │    │                 │
│  Token          │    └─────────┬───────┘
└─────────┬───────┘              │
          │                      ▼
          ▼              ┌─────────────────┐
┌─────────────────┐      │  User Enters    │
│  Validate Token │      │  New Password   │
│  with Backend   │      │  (with          │
│  API            │      │  confirmation)  │
└─────────────────┘      └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  Form           │
                         │  Validation     │
                         │  & Submission   │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  Backend API    │
                         │  POST /password-│
                         │  reset/reset    │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  Update User    │
                         │  Password in    │
                         │  Database       │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  Redirect to    │
                         │  Login Page     │
                         │  with Success   │
                         └─────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Registration   │    │  Login Error    │    │  Token Expired  │
│  Error          │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Common Errors: │    │  Common Errors: │    │  Auto Redirect  │
│  - Email exists │    │  - Wrong email  │    │  to Login Page  │
│  - Weak password│    │  - Wrong pass   │    │  & Clear Token  │
│  - Invalid data │    │  - User not     │    │                 │
└─────────────────┘    │  found          │    └─────────────────┘
                       └─────────────────┘
```

## User State Management

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  App Start      │    │  User Logged In │    │  User Logs Out  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Check for      │    │  Store User     │    │  Clear Token    │
│  Stored Token   │    │  Data in State  │    │  from Storage   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Token Found?   │    │  Protected      │    │  Redirect to    │
│                 │    │  Routes         │    │  Home Page      │
│  [Yes] [No]     │    │  Available      │    │                 │
└─────────┬───────┘    └─────────────────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│  Validate Token │
│  with Backend   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Token Valid?   │
│                 │
│  [Yes] [No]     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│  Auto Login     │    │  Clear Invalid  │
│  User           │    │  Token          │
└─────────────────┘    └─────────────────┘
```

## Key Components

### Frontend
- **Auth Context**: Manages user state globally
- **Protected Routes**: Router guards for authenticated pages
- **Login/Register Forms**: User input and validation
- **Password Reset Pages**: ForgotPassword and ResetPassword components
- **Nordic Design System**: Consistent styling with app's design language
- **Token Storage**: localStorage for JWT persistence

### Backend
- **Auth Routes**: `/auth/register`, `/auth/login`, `/auth/logout`
- **Password Reset Routes**: `/password-reset/forgot`, `/password-reset/reset`, `/password-reset/validate`
- **JWT Middleware**: Verifies tokens on protected routes
- **Password Hashing**: bcrypt for secure password storage
- **Email Service**: Nodemailer with Gmail SMTP support
- **User Model**: Prisma schema for user data

### Security Features
- **JWT Tokens**: Stateless authentication (auth + password reset)
- **Password Hashing**: bcrypt with salt rounds
- **Reset Token Security**: 1-hour expiry, unique per request
- **Email Verification**: Secure token delivery via email
- **Input Validation**: Server-side validation
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Prevent brute force attacks 