const request = require('supertest');
const app = require('../server');

describe('Performance Tests', () => {
  describe('Response Times', () => {
    test('health endpoint should respond quickly', async () => {
      const start = Date.now();
      await request(app).get('/health').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test('engines endpoint should respond quickly', async () => {
      const start = Date.now();
      await request(app).get('/api/engines').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });

  describe('Memory Usage', () => {
    test('should not have excessive memory usage', async () => {
      const memBefore = process.memoryUsage();
      
      // Make several requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(request(app).get('/health'));
      }
      await Promise.all(promises);
      
      const memAfter = process.memoryUsage();
      const memIncrease = memAfter.heapUsed - memBefore.heapUsed;
      
      // Should not increase memory by more than 50MB
      expect(memIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Concurrent Requests', () => {
    test('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(request(app).get('/health'));
      }
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.status === 200).length;
      
      expect(successCount).toBe(20);
    });
  });
});
