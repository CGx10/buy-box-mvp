const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
  describe('Health Endpoints', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });

    test('GET /metrics should return performance metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('errorCount');
    });
  });

  describe('API Endpoints', () => {
    test('GET /api/engines should return available engines', async () => {
      const response = await request(app)
        .get('/api/engines')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('engines');
      expect(response.body).toHaveProperty('defaultEngine');
    });

    test('POST /api/analyze with valid data should succeed', async () => {
      const validUserData = {
        sales_marketing_evidence: 'Test sales experience',
        operations_systems_evidence: 'Test operations experience',
        finance_analytics_evidence: 'Test finance experience',
        team_culture_evidence: 'Test team experience',
        product_technology_evidence: 'Test product experience',
        interests_topics: 'business, technology',
        top_motivators: ['freedom', 'financial_growth'],
        risk_tolerance: 'moderate',
        time_commitment: 'part_time',
        investment_capacity: '100000-500000',
        industry_preferences: ['technology', 'healthcare'],
        geographic_preferences: ['north_america'],
        deal_size_preference: 'small_medium',
        acquisition_timeline: '6-12_months',
        previous_experience: 'none',
        current_role: 'executive',
        company_size: 'medium',
        years_experience: '10-15'
      };

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

      const response = await request(app)
        .post('/api/analyze')
        .send({ userData: validUserData, engine: 'traditional' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('POST /api/analyze with invalid data should fail', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ userData: {} })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Static Files', () => {
    test('GET / should serve index.html', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });
});
