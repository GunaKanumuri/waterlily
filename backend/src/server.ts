const express = require('express');
const cors = require('cors');
require('dotenv').config();
import database, { SurveyData } from './database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Simple validation function
function validateSurvey(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.full_name || data.full_name.trim().length < 2) errors.push('Full name required');
  if (!data.age || data.age < 18 || data.age > 120) errors.push('Age must be 18-120');
  if (!data.gender) errors.push('Gender required');
  if (!data.marital_status) errors.push('Marital status required');
  if (!data.health_status) errors.push('Health status required');
  if (!data.annual_income) errors.push('Annual income required');
  if (!data.has_insurance) errors.push('Insurance status required');
  if (!data.savings_account) errors.push('Savings info required');
  
  return errors;
}

// Root endpoint
app.get('/', (req: any, res: any) => {
  res.json({
    message: 'Waterlily Survey API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/api/v1/survey/health', (req: any, res: any) => {
  res.json({
    success: true,
    message: 'Survey API is running',
    timestamp: new Date().toISOString()
  });
});

// Submit survey
app.post('/api/v1/survey/submit', (req: any, res: any) => {
  try {
    console.log('📨 Received survey submission:', req.body);
    
    // Validate input
    const errors = validateSurvey(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Prepare survey data
    const surveyData: SurveyData = {
      full_name: req.body.full_name,
      age: Number(req.body.age),
      gender: req.body.gender,
      marital_status: req.body.marital_status,
      health_status: req.body.health_status,
      chronic_conditions: req.body.chronic_conditions || null,
      medications: req.body.medications || null,
      annual_income: req.body.annual_income,
      has_insurance: req.body.has_insurance,
      savings_account: req.body.savings_account
    };

    // Save to database
    database.saveSurvey(surveyData, (result) => {
      if (result.success) {
        console.log(' Survey saved successfully with ID:', result.id);
        res.status(201).json({
          success: true,
          message: 'Survey submitted successfully',
          data: { 
            id: result.id, 
            submission_date: new Date().toISOString() 
          }
        });
      } else {
        console.error(' Database save failed:', result.error);
        res.status(500).json({
          success: false,
          message: 'Failed to save survey',
          error: result.error
        });
      }
    });
  } catch (error: any) {
    console.error(' Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all surveys
app.get('/api/v1/survey/all', (req: any, res: any) => {
  database.getAllSurveys((result) => {
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  });
});

// Get statistics
app.get('/api/v1/survey/stats', (req: any, res: any) => {
  database.getStats((result) => {
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  });
});

// Analytics endpoint
app.post('/api/v1/survey/analytics', (req: any, res: any) => {
  console.log('Analytics Event:', {
    event_type: req.body.event_type,
    step_name: req.body.step_name,
    session_id: req.body.session_id,
    timestamp: req.body.timestamp || new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Analytics logged successfully' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('Waterlily Survey API Started');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/v1/survey/health`);
  console.log(`Root: http://localhost:${PORT}/`);
  console.log('Server ready to accept requests');
});