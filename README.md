**Language Learning Adventures**

A kid-friendly AI-powered platform that makes language learning fun and engaging through interactive stories and achievements.
<img width="1305" alt="Screenshot 2025-03-29 at 13 43 20" src="https://github.com/user-attachments/assets/22b4c46d-f143-4c25-8db7-d6945ffc2808" />

<img width="1095" alt="Screenshot 2025-03-29 at 13 43 33" src="https://github.com/user-attachments/assets/765173e7-2b1d-4586-bebe-d44411529c9d" />

<img width="923" alt="Screenshot 2025-03-29 at 13 43 47" src="https://github.com/user-attachments/assets/d4341df6-cd42-4b75-adf5-77e49b0c3f5b" />

<img width="843" alt="Screenshot 2025-03-29 at 13 43 57" src="https://github.com/user-attachments/assets/5c07050b-d7a6-4c5b-8b4e-18befe81873f" />

<img width="1441" alt="Screenshot 2025-03-29 at 13 44 16" src="https://github.com/user-attachments/assets/edae0c93-02fe-4caa-a3b9-61bd42468907" />


**Key Features:**

✅ Personalized Story Generation
- Generate custom stories based on chosen topic
- Support for 16+ languages for learning and native language comprehension
- Adjustable difficulty levels (Beginner, Intermediate, Advanced)

✅ Interactive Learning Elements
- Audio playback of stories
- Interactive translations for key phrases
- One-click story translation preview
- Speech recognition for pronunciation practice
- Progress tracking with achievement badges
- PDF export functionality for offline reading

✅ User Progress System
- Achievement levels: Beginner(🌱), Explorer(🌟), Adventurer(🚀), Master(👑), Legend(🏆)
- Visual progress tracking
- Story completion tracking
- Vocabulary collection and practice

✅ Internationalization
- Interface available in English and German
- Easy language toggle with flag indicators
- Localized content and navigation

**Technical Stack:**

Frontend:
- React with TypeScript
- TanStack Query for data fetching
- Framer Motion for animations
- Tailwind CSS + shadcn/ui for styling
- Wouter for routing

Backend:
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Session-based authentication

AI Integration:
- OpenAI API for story generation and translation
- DALL-E for image generation
- Text-to-speech for audio generation
- Speech recognition for pronunciation practice

Database Schema:
- Users (authentication, preferences)
- Stories (content, translations)
- Completed Stories (progress tracking)
- Vocabulary Items (learning tracking)

**Deployment Options:**
- Docker & Docker Compose (recommended)
- Manual deployment to any Node.js hosting platform
- Cloud platforms (Google Cloud Run, AWS, Azure, Heroku)
- Self-hosted on VPS or local server

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 15 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Option 1: Docker Compose (Recommended for Local Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd LinguaStoryMate
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Edit `.env` and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the application with Docker Compose:
```bash
docker-compose up -d
```

5. The application will be available at `http://localhost:5000`

6. To stop the application:
```bash
docker-compose down
```

### Option 2: Manual Setup

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd LinguaStoryMate
npm install
```

2. Set up PostgreSQL database:
```bash
# Create a PostgreSQL database named 'linguastorymate'
createdb linguastorymate
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/linguastorymate
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_random_secret_here
PORT=5000
NODE_ENV=development
```

5. Run database migrations:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

7. For production build:
```bash
npm run build
npm start
```

### Option 3: Docker Deployment

Build and run the Docker container:

```bash
# Build the image
docker build -t linguastorymate .

# Run the container
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e OPENAI_API_KEY=your_key \
  -e SESSION_SECRET=your_secret \
  linguastorymate
```

## Environment Variables

See `.env.example` for all available configuration options:

- `DATABASE_URL` (required): PostgreSQL connection string
- `OPENAI_API_KEY` (required): OpenAI API key for AI features
- `SESSION_SECRET` (required): Secret for session encryption
- `PORT` (optional): Server port (default: 5000)
- `EMAIL_USER` (optional): Gmail address for password reset
- `EMAIL_PASSWORD` (optional): Gmail app password
- `APP_URL` (optional): Your application URL

## Cloud Deployment

### Google Cloud Run

```bash
# Build and deploy to Cloud Run
gcloud run deploy linguastorymate \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=your_db_url,OPENAI_API_KEY=your_key,SESSION_SECRET=your_secret
```

### Heroku

```bash
# Create a new Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set SESSION_SECRET=your_secret

# Deploy
git push heroku main
```

### AWS/Azure/Other

Use the provided Dockerfile to deploy to any container-based hosting platform.

**How to Use:**
1. Create an account or log in
2. Choose your learning language and native language
3. Select a topic and difficulty level
4. Generate a personalized story
5. Read, listen, and learn with interactive translations
6. Practice pronunciation with speech recognition
7. Preview story translations in different languages
8. Complete stories to earn achievements
9. Track your progress in the settings page
10. Export stories to PDF for offline learning

The application is designed to make language learning engaging and effective for children while providing a solid technical foundation for scalability and future enhancements.
