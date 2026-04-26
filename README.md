<<<<<<< HEAD
# Employee Card System

A web-based employee management system that allows you to create, manage, and export employee cards with photos and custom fields.

## 🔗 Repository
https://github.com/Ramshad03/employee-card

## 🚀 Features
- Add, edit, and delete employee cards
- Upload and crop profile photos
- Add custom fields (e.g. Blood Group, Passport, Emergency Contact)
- Search and filter employees in real time
- Export employee data as CSV
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
│   ├── server.js        # Express server & API routes
│   ├── employees.json   # Data storage
│   └── uploads/         # Photo uploads folder
│
├── frontend/
│   ├── index.html       # Homepage
│   ├── employees.html   # Employee directory page
│   ├── style.css        # Styling
│   └── app.js           # Frontend logic
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
git clone https://github.com/Ramshad03/employee-card.git

2. Navigate to the project folder
cd employee-card

3. Install dependencies
npm install

4. Start the server
npm start

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

## 📌 Notes
- All data is stored in `backend/employees.json`
- Photos are stored as base64 strings inside the JSON file
- The system is designed for local use only at this stage
- Future upgrade: Replace JSON storage with a proper database (MongoDB/SQLite)

## 👤 Author
Ramshad03
=======
# Employee Card System

A web-based employee management system that allows you to create, manage, and export employee cards with photos and custom fields.

## 🔗 Repository
https://github.com/Ramshad03/employee-card

## 🚀 Features
- Add, edit, and delete employee cards
- Upload and crop profile photos
- Add custom fields (e.g. Blood Group, Passport, Emergency Contact)
- Search and filter employees in real time
- Export employee data as CSV
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
│   ├── server.js        # Express server & API routes
│   ├── employees.json   # Data storage
│   └── uploads/         # Photo uploads folder
│
├── frontend/
│   ├── index.html       # Homepage
│   ├── employees.html   # Employee directory page
│   ├── style.css        # Styling
│   └── app.js           # Frontend logic
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
git clone https://github.com/Ramshad03/employee-card.git

2. Navigate to the project folder
cd employee-card

3. Install dependencies
npm install

4. Start the server
npm start

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

## 📌 Notes
- All data is stored in `backend/employees.json`
- Photos are stored as base64 strings inside the JSON file
- The system is designed for local use only at this stage
- Future upgrade: Replace JSON storage with a proper database (MongoDB/SQLite)

## 👤 Author
Ramshad03
>>>>>>> 1acda911d83f40ede33fd8d415eea7ba54a186a0

i