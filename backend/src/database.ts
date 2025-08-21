const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// TypeScript interfaces
export interface SurveyData {
  full_name: string;
  age: number;
  gender: string;
  marital_status: string;
  health_status: string;
  chronic_conditions?: string;
  medications?: string;
  annual_income: string;
  has_insurance: string;
  savings_account: string;
}

class Database {
  private db: any;

  constructor() {
    const dbPath = process.env.DB_PATH || './database/waterlily.db';
    
    // Create database directory
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Connect to database
    this.db = new sqlite3.Database(dbPath, (err: any) => {
      if (err) {
        console.error('Database error:', err);
        process.exit(1);
      }
      console.log('Connected to SQLite database');
      this.createTable();
    });
  }

  private createTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS survey_responses (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        marital_status TEXT NOT NULL,
        health_status TEXT NOT NULL,
        chronic_conditions TEXT,
        medications TEXT,
        annual_income TEXT NOT NULL,
        has_insurance TEXT NOT NULL,
        savings_account TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(sql, (err: any) => {
      if (err) console.error('Table creation error:', err);
      else console.log('✅ Database table ready');
    });
  }

  // Save survey with callback
  saveSurvey(data: SurveyData, callback: (result: any) => void): void {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    const sql = `INSERT INTO survey_responses (
      id, full_name, age, gender, marital_status, health_status,
      chronic_conditions, medications, annual_income, has_insurance, savings_account
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    this.db.run(sql, [
      id, data.full_name, data.age, data.gender, data.marital_status,
      data.health_status, data.chronic_conditions, data.medications,
      data.annual_income, data.has_insurance, data.savings_account
    ], function(err: any) {
      if (err) callback({ success: false, error: err.message });
      else callback({ success: true, id });
    });
  }

  // Get all surveys
  getAllSurveys(callback: (result: any) => void): void {
    this.db.all('SELECT * FROM survey_responses ORDER BY created_at DESC', [], (err: any, rows: any) => {
      if (err) callback({ success: false, error: err.message });
      else callback({ success: true, data: rows });
    });
  }

  // Get statistics
  getStats(callback: (result: any) => void): void {
    const sql = `SELECT 
      COUNT(*) as total_responses,
      AVG(age) as average_age,
      COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
      COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count
    FROM survey_responses`;

    this.db.get(sql, [], (err: any, row: any) => {
      if (err) callback({ success: false, error: err.message });
      else callback({ success: true, data: row });
    });
  }
}

export default new Database();