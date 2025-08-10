const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  test('GET /api/health should return healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Subscriptions API', () => {
  test('GET /api/subscriptions should return empty array initially', async () => {
    const response = await request(app)
      .get('/api/subscriptions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/subscriptions/stats/summary should return stats', async () => {
    const response = await request(app)
      .get('/api/subscriptions/stats/summary')
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('active');
  });
});

describe('Nodes API', () => {
  test('GET /api/nodes should return empty array initially', async () => {
    const response = await request(app)
      .get('/api/nodes')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/nodes/stats should return node statistics', async () => {
    const response = await request(app)
      .get('/api/nodes/stats')
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('tested');
    expect(response.body).toHaveProperty('fast');
    expect(response.body).toHaveProperty('avg_latency');
  });

  test('POST /api/nodes/test-all should start speed test', async () => {
    const response = await request(app)
      .post('/api/nodes/test-all')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Speed test started');
  });
});

describe('Export API', () => {
  test('GET /api/export should return available formats', async () => {
    const response = await request(app)
      .get('/api/export')
      .expect(200);

    expect(response.body).toHaveProperty('available_formats');
    expect(Array.isArray(response.body.available_formats)).toBe(true);
    expect(response.body).toHaveProperty('total_nodes');
    expect(response.body).toHaveProperty('nodes');
  });
});