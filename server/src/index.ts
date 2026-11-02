import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import jobRoutes from './routes/job.routes';
import matchRoutes from './routes/match.routes';
import skillGapRoutes from './routes/skillGap.routes';
import optimizationRoutes from './routes/optimization.routes';
import builderRoutes from './routes/builder.routes';
import coverLetterRoutes from './routes/coverLetter.routes';
import interviewRoutes from './routes/interview.routes';
import applicationRoutes from './routes/application.routes';
import careerSwitchRoutes from './routes/careerSwitch.routes';
import systemRoutes from './routes/system.routes';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // In development, allow localhost origins
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin === ENV.CLIENT_URL
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get(['/health', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'RoleForge Server', uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/gaps', skillGapRoutes);
app.use('/api/optimizations', optimizationRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/career-switch', careerSwitchRoutes);
app.use('/api/system', systemRoutes);

// Catch 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Boot function
const startServer = async () => {
  try {
    await connectDB();
    const port = ENV.PORT;
    const server = app.listen(port, () => {
      console.log(`[RoleForge Server] Running on http://localhost:${port} in ${ENV.NODE_ENV} mode`);
    });

    const shutdown = async () => {
      console.log('\n[RoleForge Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[RoleForge Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[RoleForge Server] Initialization failed:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

