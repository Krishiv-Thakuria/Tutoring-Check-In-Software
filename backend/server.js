const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    rating INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`);
});

// Helper function to promisify database queries
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// API Routes

// Check in a student
app.post('/api/checkin', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if student exists
    let student = await dbGet('SELECT * FROM students WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    
    if (!student) {
      // Create new student
      const result = await dbRun('INSERT INTO students (name) VALUES (?)', [name.trim()]);
      student = await dbGet('SELECT * FROM students WHERE id = ?', [result.id]);
    }

    // Check if student is already checked in
    const activeCheckIn = await dbGet(
      'SELECT * FROM check_ins WHERE student_id = ? AND check_out_time IS NULL',
      [student.id]
    );

    if (activeCheckIn) {
      return res.status(400).json({ error: 'Student is already checked in' });
    }

    // Create check-in record
    const checkInResult = await dbRun(
      'INSERT INTO check_ins (student_id) VALUES (?)',
      [student.id]
    );

    const checkIn = await dbGet('SELECT * FROM check_ins WHERE id = ?', [checkInResult.id]);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        first_seen: student.first_seen
      },
      checkIn: {
        id: checkIn.id,
        check_in_time: checkIn.check_in_time
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in student' });
  }
});

// Get all checked-in students
app.get('/api/checked-in', async (req, res) => {
  try {
    const checkedIn = await dbAll(`
      SELECT 
        s.id,
        s.name,
        s.first_seen,
        c.id as check_in_id,
        c.check_in_time
      FROM students s
      INNER JOIN check_ins c ON s.id = c.student_id
      WHERE c.check_out_time IS NULL
      ORDER BY c.check_in_time DESC
    `);

    res.json(checkedIn);
  } catch (error) {
    console.error('Get checked-in error:', error);
    res.status(500).json({ error: 'Failed to get checked-in students' });
  }
});

// Check out a student
app.post('/api/checkout', async (req, res) => {
  try {
    const { checkInId, rating } = req.body;

    if (!checkInId) {
      return res.status(400).json({ error: 'Check-in ID is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    await dbRun(
      'UPDATE check_ins SET check_out_time = CURRENT_TIMESTAMP, rating = ? WHERE id = ?',
      [rating, checkInId]
    );

    const checkIn = await dbGet('SELECT * FROM check_ins WHERE id = ?', [checkInId]);
    const student = await dbGet('SELECT * FROM students WHERE id = ?', [checkIn.student_id]);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name
      },
      checkOut: {
        check_out_time: checkIn.check_out_time,
        rating: checkIn.rating
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to check out student' });
  }
});

// Search for students by name
app.get('/api/students/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const students = await dbAll(
      'SELECT * FROM students WHERE LOWER(name) LIKE LOWER(?) ORDER BY first_seen DESC LIMIT 20',
      [`%${q.trim()}%`]
    );

    res.json(students);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// Get all students (for returning student list)
app.get('/api/students', async (req, res) => {
  try {
    const students = await dbAll(
      'SELECT * FROM students ORDER BY first_seen DESC LIMIT 50'
    );
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to get students' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





