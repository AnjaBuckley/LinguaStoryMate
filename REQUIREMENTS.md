# Project Requirements

## System Requirements
- Node.js v20.0.0 or higher
- PostgreSQL 15 or higher
- Modern web browser (Chrome, Edge, or Firefox) for speech recognition support

## Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up required environment variables:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   ```

## Database Setup
The application requires a PostgreSQL database. The schema will be automatically created using Drizzle ORM.

To initialize the database:
```bash
npm run db:push
```

## Development
Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5000

## Features Requirements
- Speech Recognition API (supported in Chrome, Edge)
- Audio playback capabilities
- WebGL support for animations
- Minimum 8GB RAM recommended for OpenAI API integration
- Stable internet connection for API calls

## Browser Support
- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

## Optional Dependencies
- Git (for version control)
- VS Code or similar IDE with TypeScript support
