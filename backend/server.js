const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'employees.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(express.static(path.join(__dirname, '../frontend')));

// Helper: read employees
function readEmployees() {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data).employees;
}

// Helper: write employees
function writeEmployees(employees) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ employees }, null, 2));
}

// POST upload photo - store as base64
app.post('/api/upload', (req, res) => {
  try {
    console.log('Upload request received');
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });
    console.log('Image received, length:', image.length);
    // Return base64 directly as the photo URL
    res.json({ photoUrl: image });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET all employees
app.get('/api/employees', (req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

// POST new employee
app.post('/api/employees', (req, res) => {
  const employees = readEmployees();
  const newEmployee = { id: Date.now().toString(), ...req.body };
  employees.push(newEmployee);
  writeEmployees(employees);
  res.status(201).json(newEmployee);
});

// PUT update employee
app.put('/api/employees/:id', (req, res) => {
  let employees = readEmployees();
  const index = employees.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });
  employees[index] = { ...employees[index], ...req.body };
  writeEmployees(employees);
  res.json(employees[index]);
});

// DELETE employee
app.delete('/api/employees/:id', (req, res) => {
  let employees = readEmployees();
  employees = employees.filter(e => e.id !== req.params.id);
  writeEmployees(employees);
  res.json({ message: 'Employee deleted' });
});

// GET export employees as CSV
app.get('/api/employees/export', (req, res) => {
  const employees = readEmployees();
  const headers = ['id', 'name', 'role', 'email', 'phone', 'department'];
  const rows = employees.map(e =>
    headers.map(h => `"${(e[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
  res.send(csv);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});