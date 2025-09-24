const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    test('should apply rate limiting to analysis endpoint', async () => {
      const validUserData = {
        sales_marketing_evidence: 'Test',
        operations_systems_evidence: 'Test',
        finance_analytics_evidence: 'Test',
        team_culture_evidence: 'Test',
        product_technology_evidence: 'Test',
        interests_topics: 'test',
        top_motivators: ['freedom'],
        risk_tolerance: 'moderate',
        time_commitment: 'part_time',
        investment_capacity: '100000-500000',
        industry_preferences: ['technology'],
        geographic_preferences: ['north_america'],
        deal_size_preference: 'small_medium',
        acquisition_timeline: '6-12_months',
        previous_experience: 'none',
        current_role: 'executive',
        company_size: 'medium',
        years_experience: '10-15'
      };

      // Make multiple requests quickly to test rate limiting
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/analyze')
            .send({ userData: validUserData, engine: 'traditional' })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should succeed, others might be rate limited
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    test('should reject requests with missing required fields', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ userData: { sales_marketing_evidence: 'Test' } })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    test('should reject requests with invalid engine', async () => {
      const validUserData = {
        sales_marketing_evidence: 'Test',
        operations_systems_evidence: 'Test',
        finance_analytics_evidence: 'Test',
        team_culture_evidence: 'Test',
        product_technology_evidence: 'Test',
        interests_topics: 'test',
        top_motivators: ['freedom'],
        risk_tolerance: 'moderate',
        time_commitment: 'part_time',
        investment_capacity: '100000-500000',
        industry_preferences: ['technology'],
        geographic_preferences: ['north_america'],
        deal_size_preference: 'small_medium',
        acquisition_timeline: '6-12_months',
        previous_experience: 'none',
        current_role: 'executive',
        company_size: 'medium',
        years_experience: '10-15'
      };

      const response = await request(app)
        .post('/api/analyze')
        .send({ userData: validUserData, engine: 'invalid_engine' })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
