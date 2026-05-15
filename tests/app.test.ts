import request from 'supertest';
import app from '../src/index';

describe('App', () => {
  it('should return OK on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
