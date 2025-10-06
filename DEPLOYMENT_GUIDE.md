# 🚀 SkillBridge Deployment Guide

This guide covers deploying your SkillBridge platform to production environments.

## 📋 Prerequisites

- Node.js 16+ installed
- Supabase account and project
- Git repository (GitHub, GitLab, etc.)
- Domain name (optional)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created

### 2. Run Database Migrations
1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Run the migration files in order:
   - `supabase/migrations/create_users_table.sql`
   - `supabase/migrations/create_projects_table.sql`
   - `supabase/migrations/create_proposals_table.sql`

### 3. Get Database Credentials
From your Supabase project settings:
- **Project URL**: `https://your-project.supabase.co`
- **Anon Key**: For frontend (public)
- **Service Role Key**: For backend (private)

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Option 2: Netlify

1. **Build Settings**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

2. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Option 3: AWS S3 + CloudFront

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom error pages for SPA routing

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Connect your GitHub repository

2. **Configure Service**
   - Select the `server` folder as root directory
   - Railway will auto-detect Node.js

3. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_very_secure_jwt_secret_key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   PORT=3001
   ```

4. **Deploy**
   - Railway will automatically deploy on git push
   - Get your backend URL from Railway dashboard

### Option 2: Heroku

1. **Prepare for Deployment**
   ```bash
   # Create Procfile in server directory
   echo "web: node index.js" > server/Procfile
   ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku

   # Login and create app
   heroku login
   heroku create your-app-name

   # Set environment variables
   heroku config:set VITE_SUPABASE_URL=https://your-project.supabase.co
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com

   # Deploy
   git subtree push --prefix server heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the `server` folder

2. **Configure Build**
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Environment**: Node.js

3. **Environment Variables**
   Add all required environment variables in the dashboard

### Option 4: AWS Elastic Beanstalk

1. **Prepare Application**
   ```bash
   # Create .ebextensions/nodecommand.config
   mkdir server/.ebextensions
   cat > server/.ebextensions/nodecommand.config << EOF
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm start"
   EOF
   ```

2. **Deploy**
   ```bash
   # Install EB CLI
   pip install awsebcli

   # Initialize and deploy
   cd server
   eb init
   eb create production
   eb deploy
   ```

## 🔐 Environment Variables Reference

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_very_secure_jwt_secret_key_make_it_long_and_random
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001

# Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🌐 Custom Domain Setup

### Frontend Domain
1. **Vercel**
   - Go to project settings
   - Add custom domain
   - Configure DNS records

2. **Netlify**
   - Go to domain settings
   - Add custom domain
   - Configure DNS records

### Backend Domain
1. **Railway**
   - Go to project settings
   - Add custom domain
   - Configure CNAME record

2. **Heroku**
   ```bash
   heroku domains:add api.yourdomain.com
   ```

## 🔍 Health Checks & Monitoring

### Backend Health Check
Your backend includes a health check endpoint:
```
GET https://your-backend-url.com/api/health
```

### Monitoring Setup
1. **Uptime Monitoring**
   - Use services like UptimeRobot or Pingdom
   - Monitor both frontend and backend URLs

2. **Error Tracking**
   - Integrate Sentry for error tracking
   - Add to both frontend and backend

3. **Performance Monitoring**
   - Use Google Analytics for frontend
   - Use application performance monitoring for backend

## 🚀 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd server && npm install
      - name: Deploy to Railway
        run: |
          # Add Railway deployment commands
```

## 🔧 Production Optimizations

### Frontend Optimizations
1. **Build Optimizations**
   ```bash
   # Build with optimizations
   npm run build
   
   # Analyze bundle size
   npm install -g webpack-bundle-analyzer
   npx webpack-bundle-analyzer dist/assets/*.js
   ```

2. **CDN Setup**
   - Use CloudFront or Cloudflare
   - Enable gzip compression
   - Set proper cache headers

### Backend Optimizations
1. **Performance**
   - Enable compression middleware
   - Implement caching strategies
   - Use connection pooling

2. **Security**
   - Enable HTTPS only
   - Set security headers
   - Implement rate limiting
   - Use environment variables for secrets

## 🐛 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Verify values are correct

3. **CORS Issues**
   - Update FRONTEND_URL in backend environment
   - Check CORS configuration in server/index.js

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies are correct

### Debugging Tips
1. **Check Logs**
   - Frontend: Browser console
   - Backend: Application logs
   - Database: Supabase logs

2. **Test API Endpoints**
   ```bash
   # Test health check
   curl https://your-backend-url.com/api/health
   
   # Test with authentication
   curl -H "Authorization: Bearer your-token" https://your-backend-url.com/api/auth/me
   ```

## 📊 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds to health checks
- [ ] Database connections work
- [ ] User registration/login works
- [ ] Project creation/management works
- [ ] Proposal system works
- [ ] Email notifications work (if configured)
- [ ] All environment variables are set
- [ ] HTTPS is enabled
- [ ] Custom domains are configured
- [ ] Monitoring is set up
- [ ] Backups are configured

## 🎉 Success!

Your SkillBridge platform is now live in production! 

**Frontend URL**: https://your-frontend-domain.com
**Backend API**: https://your-backend-domain.com/api
**API Documentation**: https://your-backend-domain.com/api

Remember to:
- Monitor application performance
- Keep dependencies updated
- Regularly backup your database
- Monitor error logs
- Scale resources as needed

Happy freelancing! 🚀