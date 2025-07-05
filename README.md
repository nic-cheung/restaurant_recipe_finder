# 🍳 AI Recipe Recommendation Webapp

An intelligent web application that generates personalized recipes inspired by your favorite restaurants, chefs, cities, and cuisines. The app learns your preferences, considers your schedule, and ensures you can source ingredients locally.

## ✨ Features

### 🎯 Personalized Recipe Generation
- **AI-Powered Recipes**: Generate unique recipes inspired by restaurants, chefs, cities, and cuisines
- **Smart Personalization**: Adapts to your taste preferences, dietary restrictions, and cooking skill level
- **Ingredient Substitutions**: Suggests alternatives based on availability and preferences

### 👤 User Profile & Preferences
- **Dietary Restrictions**: Track allergies, intolerances, and dietary choices
- **Taste Preferences**: Spice tolerance, favorite ingredients, disliked foods
- **Cooking Profile**: Skill level, preferred cooking time, serving sizes
- **Location-Based**: Ingredient sourcing based on your area

### 📅 Smart Scheduling
- **Calendar Integration**: Considers your schedule when suggesting recipes
- **Dinner Timing**: Respects your preferred dinner time
- **Meal Planning**: Suggests recipes that fit your available time
- **Shopping Lists**: Generate shopping lists with local ingredient availability

### 🏪 Restaurant & Cuisine Inspiration
- **Restaurant Database**: Recipes inspired by famous restaurants
- **Chef Collections**: Signature dishes from renowned chefs
- **Regional Cuisines**: Authentic recipes from around the world
- **Seasonal Suggestions**: Recipes using in-season ingredients

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant_recipe_finder.git
   cd restaurant_recipe_finder
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   
   # Frontend (.env)
   cp frontend/.env.example frontend/.env
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🏗️ Project Structure

```
restaurant_recipe_finder/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
├── docs/                   # Documentation
├── PROJECT_PLAN.md         # Detailed project plan
├── DEVELOPMENT_RULES.md    # Development guidelines
└── README.md              # This file
```

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for forms
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **OpenAI API** for recipe generation

### External APIs
- **OpenAI GPT** for AI recipe generation
- **Google Calendar** for schedule integration
- **Google Maps** for location services
- **Spoonacular/Edamam** for recipe data

## 📋 Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [x] Project setup and architecture
- [ ] User authentication system
- [ ] Basic user profile management
- [ ] Simple recipe display interface

### Phase 2: Personalization (Weeks 3-4)
- [ ] User preference management
- [ ] Location-based ingredient sourcing
- [ ] Cooking time preferences

### Phase 3: AI Integration (Weeks 5-6)
- [ ] OpenAI API integration
- [ ] Recipe generation based on preferences
- [ ] Restaurant/chef/cuisine inspiration

### Phase 4: Scheduling & Smart Features (Weeks 7-8)
- [ ] Calendar integration
- [ ] Meal planning suggestions
- [ ] Shopping list generation

### Phase 5: Advanced Features (Weeks 9-10)
- [ ] Recipe rating and feedback
- [ ] Social features
- [ ] Recipe history and favorites

### Phase 6: Polish & Deployment (Weeks 11-12)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- The React and Node.js communities for excellent documentation
- All the restaurants and chefs that inspire our recipes

## 📞 Support

If you have any questions or need help, please:
- Check the [documentation](docs/)
- Open an [issue](https://github.com/yourusername/restaurant_recipe_finder/issues)
- Contact the development team

---

**Happy Cooking! 🍽️**
