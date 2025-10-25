# Migration Guide: From Replit to Self-Hosted

This document outlines the changes made to migrate LinguaStoryMate from Replit to a self-hosted solution.

## Summary of Changes

### 1. Removed Replit Dependencies

**Packages removed from `package.json`:**
- `@replit/vite-plugin-shadcn-theme-json` (was in dependencies)
- `@replit/vite-plugin-cartographer` (was in devDependencies)
- `@replit/vite-plugin-runtime-error-modal` (was in devDependencies)

**Files deleted:**
- `.replit` - Replit environment configuration
- `replit.nix` - Nix package dependencies

### 2. Updated Vite Configuration

**File: `vite.config.ts`**
- Removed all Replit plugin imports
- Removed conditional loading of cartographer plugin
- Now uses only the standard React plugin

### 3. Made Port Configurable

**File: `server/index.ts`**
- Changed from hardcoded port 5000 to configurable via `PORT` environment variable
- Default remains 5000 if not specified
- Allows deployment to platforms with dynamic port assignment (Heroku, Google Cloud Run, etc.)

### 4. Session Store Migration

**File: `server/storage.ts`**
- **Before:** Used in-memory session store (lost on restart)
- **After:** PostgreSQL-backed session store using `connect-pg-simple`
- Sessions now persist across server restarts
- Automatic session cleanup every 15 minutes
- Session table created automatically

**Important:** The `connect-pg-simple` package was already in dependencies, so no new package was required.

### 5. New Configuration Files

#### `.env.example`
Comprehensive environment variable documentation including:
- Database connection (required)
- OpenAI API key (required)
- Session secret (required)
- Server configuration (optional)
- Email configuration (optional for password reset)

#### `Dockerfile`
Multi-stage Docker build for production deployment:
- Stage 1: Build application
- Stage 2: Production image with only runtime dependencies
- Runs as non-root user for security
- Includes health check endpoint
- Optimized for small image size

#### `docker-compose.yml`
Complete local development environment:
- PostgreSQL 16 database service
- Application service
- Volume persistence for database
- Health checks and dependency management
- Environment variable configuration

#### `.dockerignore`
Optimizes Docker builds by excluding:
- node_modules
- Build artifacts
- Development files
- Documentation
- Git files

### 6. Updated Documentation

**File: `README.md`**
Added comprehensive deployment sections:
- Prerequisites
- Three deployment options (Docker Compose, Manual, Docker)
- Environment variable documentation
- Cloud deployment examples (Google Cloud Run, Heroku)
- Step-by-step setup instructions

## Breaking Changes

### For Developers

1. **Environment Variables**: Now required to run the application
   - Must create `.env` file from `.env.example`
   - Minimum required: `DATABASE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET`

2. **Session Persistence**: Sessions are now stored in PostgreSQL
   - Requires database migration (automatic via `connect-pg-simple`)
   - Sessions will survive application restarts

3. **No Replit-Specific Features**:
   - Removed Replit theme plugin
   - Removed Replit error modal
   - Removed Replit code cartographer

### For Deployment

1. **Database Required**: PostgreSQL 15+ must be available
   - Can use hosted solutions (Neon, Heroku Postgres, AWS RDS, etc.)
   - Can use Docker Compose for local development

2. **Port Configuration**:
   - Default is still 5000
   - Can be overridden with `PORT` environment variable

## Migration Checklist

If you're migrating from an existing Replit deployment:

- [ ] Export your database (if you have production data)
- [ ] Set up a new PostgreSQL database
- [ ] Create `.env` file with all required variables
- [ ] Run database migrations: `npm run db:push`
- [ ] Import your data (if applicable)
- [ ] Test locally with Docker Compose
- [ ] Deploy to your chosen platform
- [ ] Verify all functionality works
- [ ] Update DNS/domain settings

## Deployment Options

### Option 1: Docker Compose (Recommended for Local/Self-Hosted)
```bash
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

### Option 2: Manual Installation
```bash
npm install
npm run db:push
npm run build
npm start
```

### Option 3: Cloud Platforms

**Google Cloud Run:**
```bash
gcloud run deploy linguastorymate --source . --set-env-vars DATABASE_URL=...,OPENAI_API_KEY=...,SESSION_SECRET=...
```

**Heroku:**
```bash
heroku create
heroku addons:create heroku-postgresql:mini
heroku config:set OPENAI_API_KEY=...
heroku config:set SESSION_SECRET=...
git push heroku main
```

## Rollback Plan

If you need to roll back to Replit:

1. Restore `.replit` and `replit.nix` files from git history
2. Re-add Replit packages to `package.json`:
   ```bash
   npm install @replit/vite-plugin-shadcn-theme-json@^0.0.4
   npm install -D @replit/vite-plugin-cartographer@^0.0.8
   npm install -D @replit/vite-plugin-runtime-error-modal@^0.0.3
   ```
3. Revert changes to `vite.config.ts`
4. Revert changes to `server/index.ts` and `server/storage.ts`
5. Remove Docker files

## Support & Troubleshooting

### Common Issues

**Issue: "Cannot connect to database"**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Verify firewall/network settings

**Issue: "Session lost after restart"**
- This is expected with the old in-memory store
- New PostgreSQL session store prevents this

**Issue: "OpenAI API errors"**
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has credits/quota available

**Issue: "Port already in use"**
- Change `PORT` in `.env` file
- Or stop the conflicting service

## Performance Considerations

### Database Connection Pooling
The application uses Neon's serverless PostgreSQL driver with:
- Max 20 connections
- 5 second connection timeout
- Automatic retry logic (3 attempts)

### Session Store
- Sessions pruned every 15 minutes
- Stored in `session` table in PostgreSQL
- Automatic table creation on first run

## Security Recommendations

1. **Session Secret**: Generate a strong random secret
   ```bash
   openssl rand -base64 32
   ```

2. **Database Credentials**: Use strong passwords, don't commit to git

3. **Environment Variables**: Never commit `.env` file to version control

4. **Docker**: Application runs as non-root user (nodejs:nodejs)

5. **HTTPS**: Use a reverse proxy (nginx, Caddy) or cloud platform HTTPS in production

## Next Steps / Future Improvements

Consider these optional enhancements:

1. **Cloud Storage**: Move images/audio from database to S3/GCS
   - Currently stored as base64 in database
   - Can cause database bloat with many stories

2. **Redis Session Store**: For high-traffic deployments
   - Faster than PostgreSQL for sessions
   - Better horizontal scaling

3. **CDN Integration**: Serve static assets via CDN

4. **Monitoring**: Add application monitoring (Sentry, DataDog, etc.)

5. **CI/CD**: Set up automated testing and deployment

6. **Database Backups**: Implement automated backup strategy

## Conclusion

The application is now fully self-hostable and no longer depends on Replit infrastructure. All core functionality remains intact, with improved session persistence and deployment flexibility.
