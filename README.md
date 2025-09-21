# SkillBridge - Freelancer Client Platform

A modern web platform that connects clients with freelancers across both technical and non-technical fields.

## 🚀 Features

- **Dual User System**: Separate registration and dashboards for clients and freelancers
- **Project Management**: Post projects, submit proposals, and track progress
- **Cross-Industry Support**: From web development to event planning and tutoring
- **Real-time Updates**: Live proposal status and project management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **User Profiles**: Comprehensive profiles with skills, portfolios, and ratings

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📋 Project Categories

### Technical Fields
- Web Development
- Mobile App Development
- Graphic Design
- UI/UX Design
- Data Analysis
- Digital Marketing

### Non-Technical Fields
- Event Planning
- Tutoring & Education
- Home Services
- Content Writing
- Translation Services
- Business Consulting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skillbridge-freelancer-platform.git
cd skillbridge-freelancer-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your Supabase credentials and other environment variables.

4. Set up the database:
- Create a new Supabase project
- Run the migration files in the `supabase/migrations` folder
- Update your `.env` file with the Supabase credentials

5. Start the development servers:

**Option 1: Start both frontend and backend together**
```bash
npm run dev:full
```

**Option 2: Start them separately**
```bash
# Terminal 1 - Backend API
npm run dev:server

# Terminal 2 - Frontend
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## 📱 Usage

### For Clients
1. Register as a client
2. Complete your profile with company information
3. Post projects with detailed requirements and budget
4. Review and manage freelancer proposals
5. Hire the best talent for your needs

### For Freelancers
1. Register as a freelancer
2. Build your profile with skills and experience
3. Browse available projects
4. Submit compelling proposals
5. Get hired and deliver quality work

## 🎯 User Roles

### Client Dashboard
- Post new projects
- Manage active projects
- Review freelancer proposals
- Track project progress
- Handle payments and communication

### Freelancer Dashboard
- Browse available projects
- Submit proposals with custom pricing
- Manage active projects
- Build portfolio and reputation
- Track earnings and success rate

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run dev:server` - Start backend API server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── pages/              # Page components
├── services/           # API service layer
├── styles/             # CSS and styling
└── utils/              # Utility functions

server/
├── routes/             # API route handlers
├── middleware/         # Express middleware
├── config/             # Configuration files
└── index.js            # Server entry point

supabase/
└── migrations/         # Database migration files
```

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **users**: User accounts (clients and freelancers)
- **projects**: Project listings posted by clients
- **proposals**: Proposals submitted by freelancers

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 🚀 Deployment

The project is ready for deployment on platforms like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend Deployment

For production deployment, you'll need to:
1. Deploy the backend API to a service like Railway, Render, or Heroku
2. Update the `VITE_API_URL` environment variable in your frontend
3. Set up your production database on Supabase
4. Configure CORS settings for your production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Icons provided by Lucide React
- Styling powered by Tailwind CSS

## 📞 Contact

For questions or support, please open an issue on GitHub or contact [your-email@example.com]

---

**SkillBridge** - Bridging the gap between talent and opportunity 🌉