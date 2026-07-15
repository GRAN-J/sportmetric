import express from 'express';
import request from 'supertest';
import { authLimiter } from '../../modules/shared/middlewares/rate-limiter.middleware';

describe('rate-limiter.middleware', () => {
  it('bloquea solicitudes cuando se supera el límite del middleware de autenticación', async () => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(authLimiter);
    app.get('/auth-test', (_req, res) => {
      res.status(200).json({ success: true });
    });

    for (let index = 0; index < 5; index += 1) {
      const response = await request(app).get('/auth-test');
      expect(response.status).toBe(200);
    }

    const limitedResponse = await request(app).get('/auth-test');

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.text).toContain('Demasiados intentos desde esta IP');
  });
});
