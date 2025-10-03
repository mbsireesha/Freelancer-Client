# 🚀 Complete Setup Guide for SkillBridge Platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software:
- **Java 17 or higher** - [Download here](https://adoptium.net/)
- **Node.js 16 or higher** - [Download here](https://nodejs.org/)
- **MySQL 8.0 or higher** - [Download here](https://dev.mysql.com/downloads/)
- **Maven 3.6 or higher** - [Download here](https://maven.apache.org/download.cgi)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installations:
```bash
java -version    # Should show Java 17+
node -v         # Should show Node 16+
npm -v          # Should show npm version
mysql --version # Should show MySQL 8.0+
mvn -version    # Should show Maven 3.6+
git --version   # Should show Git version
```

## 🗂️ Project Structure

After downloading, your project should look like this:
```
skillbridge-freelancer-platform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Java Spring Boot application
│   ├── src/main/java/com/skillbridge/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── security/
│   │   └── SkillBridgeApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── README.md
├── .gitignore
└── SETUP_GUIDE.md
```

## 🗄️ Database Setup

### 1. Start MySQL Service
```bash
# On Windows (if installed as service)
net start mysql

# On macOS (using Homebrew)
brew services start mysql

# On Linux (Ubuntu/Debian)
sudo systemctl start mysql
```

### 2. Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE skillbridge;

-- Create user (optional but recommended)
CREATE USER 'skillbridge_user'@'localhost' IDENTIFIED BY 'skillbridge_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON skillbridge.* TO 'skillbridge_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Test Database Connection
```bash
mysql -u skillbridge_user -p skillbridge
# Enter password: skillbridge_password
# If successful, you'll see MySQL prompt
```

## ⚙️ Backend Configuration

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Configure Database Connection
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/skillbridge
    username: skillbridge_user  # or 'root' if using root user
    password: skillbridge_password  # your MySQL password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Creates tables automatically
    show-sql: true     # Shows SQL queries in console
    
app:
  jwt:
    secret: myVerySecretKeyForJWTTokenGeneration123456789
    expiration: 604800000  # 7 days in milliseconds
  cors:
    allowed-origins: http://localhost:5173
```

### 3. Install Dependencies and Build
```bash
# Clean and install dependencies
mvn clean install

# If you encounter issues, try:
mvn clean install -U
```

### 4. Run Backend Server
```bash
# Start the Spring Boot application
mvn spring-boot:run

# Alternative: Run the JAR file
# mvn clean package
# java -jar target/skillbridge-backend-0.0.1-SNAPSHOT.jar
```

**Backend should start on:** `http://localhost:8080`

## 🎨 Frontend Configuration

### 1. Navigate to Frontend Directory
```bash
# From project root
cd ../  # if you're in backend directory
# or directly: cd frontend
```

### 2. Install Dependencies
```bash
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps
```

### 3. Configure API URL
Create `.env` file in the frontend root:
```env
VITE_API_URL=http://localhost:8080/api
```

### 4. Run Frontend Server
```bash
npm run dev
```

**Frontend should start on:** `http://localhost:5173`

## 🧪 Testing the Setup

### 1. Check Backend Health
Open browser and go to: `http://localhost:8080/api/health`
You should see: `{"status": "UP"}`

### 2. Check Frontend
Open browser and go to: `http://localhost:5173`
You should see the SkillBridge homepage.

### 3. Test Registration
1. Click "Get Started" or "Register"
2. Fill in the registration form
3. Check if user is created in database:
```sql
mysql -u skillbridge_user -p skillbridge
SELECT * FROM users;
```

## 🚀 Running Both Servers

### Option 1: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend  # or just cd .. if you're in backend
npm run dev
```

### Option 2: Using npm Scripts (from project root)
```bash
# This will start both servers concurrently
npm run dev:full
```

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### 1. Database Connection Failed
```
Error: Could not connect to database
```
**Solutions:**
- Ensure MySQL is running: `sudo systemctl status mysql`
- Check credentials in `application.yml`
- Verify database exists: `SHOW DATABASES;`
- Check firewall settings

#### 2. Port Already in Use
```
Error: Port 8080 is already in use
```
**Solutions:**
- Kill process using port: `lsof -ti:8080 | xargs kill -9`
- Change port in `application.yml`: `server.port: 8081`
- Update frontend API URL accordingly

#### 3. Maven Build Failed
```
Error: Could not resolve dependencies
```
**Solutions:**
- Check internet connection
- Clear Maven cache: `mvn clean`
- Update Maven: `mvn -U clean install`
- Check Java version: `java -version`

#### 4. Frontend Build Issues
```
Error: Module not found
```
**Solutions:**
- Delete `node_modules`: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Reinstall: `npm install`
- Check Node version: `node -v`

#### 5. CORS Issues
```
Error: CORS policy blocked
```
**Solutions:**
- Check `SecurityConfig.java` CORS configuration
- Ensure frontend URL is in allowed origins
- Restart backend server after changes

#### 6. JWT Token Issues
```
Error: Invalid token
```
**Solutions:**
- Check JWT secret in `application.yml`
- Clear browser localStorage
- Check token expiration settings

## 📊 Database Schema

The application will automatically create these tables:

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('CLIENT', 'FREELANCER') NOT NULL,
    bio TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    hourly_rate DOUBLE,
    availability VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
    client_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);
```

### Proposals Table
```sql
CREATE TABLE proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_budget INT NOT NULL,
    timeline VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id),
    UNIQUE KEY unique_proposal (project_id, freelancer_id)
);
```

## 🎯 Next Steps

1. **Test the Application:**
   - Register as both client and freelancer
   - Create projects as client
   - Submit proposals as freelancer
   - Test the complete workflow

2. **Customize the Application:**
   - Modify UI components in `frontend/src/components/`
   - Add new API endpoints in `backend/src/main/java/com/skillbridge/controller/`
   - Update database schema as needed

3. **Deploy to Production:**
   - Set up production database
   - Configure environment variables
   - Deploy backend to cloud service
   - Deploy frontend to static hosting

## 📞 Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Review application logs
3. Check database connections
4. Verify all services are running
5. Open an issue on GitHub

---

**Happy Coding! 🚀**