const request = require('supertest');
const app = require('./app');

describe('NutriHelp API - Unit Tests', () => {

  test('GET / returns app info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.app).toBe('NutriHelp API');
    expect(res.body.status).toBe('running');
  });

  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
  });

  test('GET /api/nutrition returns nutrition data', async () => {
    const res = await request(app).get('/api/nutrition');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('calories');
    expect(res.body).toHaveProperty('protein');
  });

  test('GET /api/meal-plan returns meal plan', async () => {
    const res = await request(app).get('/api/meal-plan');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('meals');
    expect(res.body.meals.length).toBeGreaterThan(0);
  });

  test('GET /api/recipes returns recipe list', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.statusCode).toBe(200);
    expect(res.body.recipes.length).toBeGreaterThan(0);
  });

  test('GET /metrics returns prometheus format', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('nutrihelp_uptime_seconds');
  });

});