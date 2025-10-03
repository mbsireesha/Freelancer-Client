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

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend (Java Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven
- **Java Version**: 17

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
- **Frontend**: Node.js (v16 or higher)
- **Backend**: Java 17 or higher
- **Database**: MySQL 8.0 or higher
- **Build Tools**: Maven, npm or yarn

### Project Structure
```
skillbridge-freelancer-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                  # Java Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
└── README.md
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/skillbridge-freelancer-platform.git
cd skillbridge-freelancer-platform
```

2. **Frontend Setup:**
```bash
# Install frontend dependencies
npm install
```

3. **Backend Setup:**
```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Or use Maven wrapper (if available)
./mvnw clean install
```

4. **Database Setup:**
```sql
-- Create MySQL database
CREATE DATABASE skillbridge;

-- Create user (optional)
CREATE USER 'skillbridge_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON skillbridge.* TO 'skillbridge_user'@'localhost';
FLUSH PRIVILEGES;
```

5. **Environment Configuration:**

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080/api
```

**Backend (application.yml):**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/skillbridge
    username: your_username
    password: your_password
```

6. **Start the development servers:**

**Start Backend (Terminal 1):**
```bash
cd backend
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

**Start Frontend (Terminal 2):**
```bash
# From project root
npm run dev
# Frontend runs on http://localhost:5173
```

7. Open your browser and navigate to `http://localhost:5173`

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
- `mvn spring-boot:run` - Start backend server
- `mvn clean install` - Build the project
- `mvn test` - Run tests
- `mvn clean package` - Package for deployment

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── utils/              # Utility functions
└── package.json

backend/
├── src/main/java/com/skillbridge/
│   ├── controller/         # REST API controllers
│   ├── service/           # Business logic services
│   ├── repository/        # Data access layer
│   ├── model/             # JPA entities
│   ├── security/          # Security configuration
│   └── config/            # Application configuration
├── src/main/resources/
│   └── application.yml    # Application properties
└── pom.xml               # Maven dependencies
```

## 🗄️ Database Schema (MySQL)

The application uses MySQL with the following main tables:

- **users**: User accounts with profiles (clients and freelancers)
- **projects**: Project listings posted by clients with skills and requirements
- **proposals**: Proposals submitted by freelancers with cover letters and budgets
- **user_skills**: Many-to-many relationship for user skills
- **project_skills**: Many-to-many relationship for project required skills

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080/api
```

**Backend (application.yml):**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/skillbridge
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
app:
  jwt:
    secret: ${JWT_SECRET:mySecretKey}
    expiration: 604800000 # 7 days
```

## 🏗️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/freelancers` - Search freelancers

### Projects
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create new project (clients only)
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/my-projects` - Get user's projects

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
- **AWS Elastic Beanstalk**: Java platform
- **DigitalOcean App Platform**: Java service
- **Railway**: Connect GitHub repository

### Database Deployment
- **AWS RDS**: MySQL instance
- **Google Cloud SQL**: MySQL database
- **DigitalOcean Managed Databases**: MySQL cluster
- **PlanetScale**: Serverless MySQL platform

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
   - Ensure MySQL is running
   - Check database credentials in application.yml
   - Verify database exists and user has permissions

2. **CORS Issues:**
   - Check CORS configuration in SecurityConfig.java
   - Ensure frontend URL is allowed in CORS origins

3. **JWT Token Issues:**
   - Verify JWT secret is set in application.yml
   - Check token expiration settings
   - Ensure Authorization header format: "Bearer <token>"

4. **Build Issues:**
   - Ensure Java 17 is installed
   - Check Maven installation
   - Clear Maven cache: `mvn clean`

## 🙏 Acknowledgments

- **Frontend**: Built with React 18 and modern web technologies
- **Backend**: Powered by Spring Boot and Spring Security
- Icons provided by Lucide React
- Styling powered by Tailwind CSS
- Database: MySQL for reliable data storage

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**SkillBridge** - Bridging the gap between talent and opportunity 🌉

### 🏆 **Full-Stack Architecture:**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Java Spring Boot + Spring Security
- **Database**: MySQL with JPA/Hibernate
- **Authentication**: JWT-based security
- **API**: RESTful web services