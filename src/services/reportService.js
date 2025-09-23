// Report service for managing user reports and history
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

class ReportService {
  constructor() {
    this.reportsCollection = 'reports';
  }

  // Save a new report
  async saveReport(userId, reportData) {
    try {
      const report = {
        userId: userId,
        title: reportData.title || 'Buybox Analysis Report',
        generatedAt: new Date(),
        formData: reportData.formData,
        analysisResults: reportData.analysisResults,
        aiModel: reportData.aiModel || 'gemini-1.5-flash',
        version: reportData.version || '1.0',
        isPublic: false,
        tags: reportData.tags || [],
        notes: reportData.notes || ''
      };

      const docRef = await addDoc(collection(db, this.reportsCollection), report);
      return { success: true, reportId: docRef.id, report: report };
    } catch (error) {
      console.error('Error saving report:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all reports for a user
  async getUserReports(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.reportsCollection),
        where('userId', '==', userId),
        orderBy('generatedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, reports: reports };
    } catch (error) {
      console.error('Error getting user reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a specific report by ID
  async getReport(reportId) {
    try {
      const docRef = doc(db, this.reportsCollection, reportId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          report: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Report not found' };
      }
    } catch (error) {
      console.error('Error getting report:', error);
      return { success: false, error: error.message };
    }
  }

  // Update a report
  async updateReport(reportId, updates) {
    try {
      const docRef = doc(db, this.reportsCollection, reportId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating report:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a report
  async deleteReport(reportId) {
    try {
      const docRef = doc(db, this.reportsCollection, reportId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting report:', error);
      return { success: false, error: error.message };
    }
  }

  // Search reports by title or tags
  async searchReports(userId, searchTerm) {
    try {
      const q = query(
        collection(db, this.reportsCollection),
        where('userId', '==', userId),
        orderBy('generatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Search in title, tags, and notes
        if (
          data.title.toLowerCase().includes(searchLower) ||
          data.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          data.notes.toLowerCase().includes(searchLower)
        ) {
          reports.push({
            id: doc.id,
            ...data
          });
        }
      });

      return { success: true, reports: reports };
    } catch (error) {
      console.error('Error searching reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Get report statistics for dashboard
  async getReportStats(userId) {
    try {
      const reportsResult = await this.getUserReports(userId, 1000); // Get more for stats
      
      if (!reportsResult.success) {
        return reportsResult;
      }

      const reports = reportsResult.reports;
      const stats = {
        totalReports: reports.length,
        thisMonth: reports.filter(r => {
          const reportDate = r.generatedAt.toDate();
          const now = new Date();
          return reportDate.getMonth() === now.getMonth() && 
                 reportDate.getFullYear() === now.getFullYear();
        }).length,
        thisWeek: reports.filter(r => {
          const reportDate = r.generatedAt.toDate();
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reportDate >= weekAgo;
        }).length,
        mostUsedModel: this.getMostUsedModel(reports),
        averageReportsPerWeek: this.calculateAverageReportsPerWeek(reports)
      };

      return { success: true, stats: stats };
    } catch (error) {
      console.error('Error getting report stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to get most used AI model
  getMostUsedModel(reports) {
    const modelCounts = {};
    reports.forEach(report => {
      const model = report.aiModel || 'unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    
    return Object.keys(modelCounts).reduce((a, b) => 
      modelCounts[a] > modelCounts[b] ? a : b, 'unknown'
    );
  }

  // Helper method to calculate average reports per week
  calculateAverageReportsPerWeek(reports) {
    if (reports.length === 0) return 0;
    
    const oldestReport = reports[reports.length - 1];
    const newestReport = reports[0];
    
    if (!oldestReport || !newestReport) return 0;
    
    const timeDiff = newestReport.generatedAt.toDate() - oldestReport.generatedAt.toDate();
    const weeksDiff = timeDiff / (1000 * 60 * 60 * 24 * 7);
    
    return weeksDiff > 0 ? (reports.length / weeksDiff).toFixed(1) : reports.length;
  }
}

// Export singleton instance
export default new ReportService();
