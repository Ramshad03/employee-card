# Employee Card System

A web-based employee management system to create, manage, and track employee cards with photos, leave tracking, and custom fields.

## 🔗 Repository
https://github.com/Ramshad03/employee-card

## 🚀 Features
- Add, edit, and delete employee cards
- Upload and crop profile photos
- 📷 Webcam capture support (desktop & mobile)
- Custom Employee ID and Name display on cards
- Add unlimited custom fields per employee
- Search and filter employees in real time
- Export employee data as CSV
- Join date tracking with duration display
- Annual leave tracking with status indicators
- Grant leave and extend leave date support
- Total leave taken calculation
- Status color border on profile photo:
  - 🟢 Green — leave not yet due (within 365 days)
  - 🔴 Red — leave overdue (past 365 days, not yet granted)
  - ⚫ Grey — currently on leave
- Clickable employee cards with full detail page
- Data stored in local JSON file

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Storage:** JSON file (employees.json)
- **Libraries:** Cropper.js (photo cropping)

## 📁 Project Structure
employee-card/
│
├── backend/
│   ├── server.js              # Express server & API routes
│   └── employees.json         # Data storage
│
├── frontend/
│   ├── employees.html         # Employee directory page
│   ├── employee-detail.html   # Employee detail page
│   ├── style.css              # Styling
│   └── app.js                 # Frontend logic
│
├── .gitignore
├── package.json
└── README.md

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed on your machine
- npm (comes with Node.js)

### Steps

1. Clone the repository
```bash
git clone https://github.com/Ramshad03/employee-card.git
```

2. Navigate to the project folder
```bash
cd employee-card
```

3. Install dependencies
```bash
npm install
```

4. Start the server
```bash
npm start
```

5. Open your browser and go to
http://localhost:3000

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | Get all employees |
| POST | /api/employees | Add new employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| POST | /api/upload | Upload photo |
| GET | /api/employees/export | Export as CSV |

## 🏖️ Leave Tracking Logic

| Status | Condition |
|--------|-----------|
| 🟢 Green | Less than 365 days since joining or last leave ended |
| 🔴 Red | 365 days passed without leave being granted |
| ⚫ Grey | Currently on leave (between grant date and end date) |

- Leave automatically resets after the granted leave period ends
- Extend leave by setting an "Extend Leave Until" date
- Total leave taken is calculated and displayed on the detail page

## 📌 Notes
- All data is stored in `backend/employees.json`
- Photos are stored as base64 strings inside the JSON file
- The system is designed for local/internal network use
- Camera access requires browser permission (allow camera in browser settings)
- Future upgrade: Replace JSON storage with a proper database (MongoDB/SQLite)

## 👤 Author
Ramshad03