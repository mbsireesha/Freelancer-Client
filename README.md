# SkillBridge - Freelancer Client Platform

A modern full-stack web platform that connects clients with freelancers across both technical and non-technical fields.

## 🚀 Features

- **Dual User System**: Separate registration and dashboards for clients and freelancers
- **Project Management**: Post projects, submit proposals, and track progress
- **Cross-Industry Support**: From web development to event planning and tutoring
- **Real-time Updates**: Live proposal status and project management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **User Profiles**: Comprehensive profiles with skills, portfolios, and ratings

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express Validator
- **Logging**: Winston

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
- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Supabase Account**: For database hosting

### Project Structure
```
skillbridge-freelancer-platform/
├── src/                      # React frontend source
├── server/                   # Node.js backend
├── supabase/                 # Database migrations
├── package.json              # Frontend dependencies
└── README.md
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/skillbridge-freelancer-platform.git
cd skillbridge-freelancer-platform
```

2. **Install Dependencies:**
```bash
# Install frontend dependencies
npm install




# Install backend dependencies
npm run server:install
```

3. **Database Setup:**
- Create a new project on [Supabase](https://supabase.com)
- Copy your project URL and service role key
- Run the migration files in your Supabase dashboard

4. **Environment Configuration:**

**Create .env file:**
```env
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start the development servers:**

```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
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

**Frontend Scripts:**
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend Scripts:**
- `npm run dev:server` - Start backend development server
- `npm run server:start` - Start backend in production mode
- `npm run dev:full` - Start both frontend and backend

### Project Structure
```
src/
├── components/              # Reusable UI components
├── context/                # React Context providers
├── pages/                  # Page components
├── services/               # API service layer
└── utils/                  # Utility functions

server/
├── routes/                 # API route handlers
├── middleware/             # Express middleware
├── config/                 # Configuration files
├── utils/                  # Utility functions
└── index.js               # Server entry point
```

## 🗄️ Database Schema (PostgreSQL)

The application uses PostgreSQL (Supabase) with the following main tables:

- **users**: User accounts with profiles (clients and freelancers)
- **projects**: Project listings posted by clients with skills and requirements
- **proposals**: Proposals submitted by freelancers with cover letters and budgets

### Environment Variables

**Required Environment Variables (.env):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🏗️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search/freelancers` - Search freelancers
- `GET /api/users/stats` - Get user statistics

### Projects
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create new project (clients only)
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/user/my-projects` - Get user's projects

### Proposals
- `POST /api/proposals` - Submit proposal (freelancers only)
- `GET /api/proposals/project/{projectId}` - Get project proposals
- `GET /api/proposals/my-proposals` - Get user's proposals
- `PUT /api/proposals/{id}/status` - Update proposal status
- `DELETE /api/proposals/{id}` - Delete proposal

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: Connect GitHub repository
- **Netlify**: Deploy from Git
- **AWS S3 + CloudFront**: Static hosting

### Backend Deployment
- **Heroku**: Java buildpack
- **Railway**: Connect GitHub repository
- **DigitalOcean App Platform**: Node.js service
- **Railway**: Connect GitHub repository

### Database Deployment
- **Supabase**: Managed PostgreSQL (recommended)
- **AWS RDS**: PostgreSQL instance
- **Google Cloud SQL**: PostgreSQL database
- **DigitalOcean Managed Databases**: PostgreSQL cluster

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Issues:**
   - Check Supabase URL and service role key
   - Verify environment variables are loaded
   - Ensure database migrations are applied

2. **CORS Issues:**
   - Check CORS configuration in server/index.js
   - Verify FRONTEND_URL environment variable

3. **JWT Token Issues:**
   - Verify JWT_SECRET environment variable
   - Check token expiration settings
   - Ensure Authorization header format: "Bearer <token>"

4. **Installation Issues:**
   - Ensure Node.js 16+ is installed
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🙏 Acknowledgments

- **Frontend**: Built with React 18, TypeScript, and Tailwind CSS
- **Backend**: Powered by Node.js, Express.js, and Supabase
- Icons provided by Lucide React
- Database: PostgreSQL via Supabase
- Authentication: JWT tokens with bcrypt hashing

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**SkillBridge** - Bridging the gap between talent and opportunity 🌉

### 🏆 **Full-Stack Architecture:**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + JWT Authentication
- **Database**: PostgreSQL (Supabase) with Row Level Security
- **Authentication**: JWT-based security
- **API**: RESTful web services