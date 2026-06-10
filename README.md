# Employee Card System

A web-based employee and vehicle fleet management system. Manage employee profiles, documents, leave and visa tracking, plus a full vehicle fleet module with registration/insurance tracking, driver assignment, fines, damage reports and complaints — all with photos, custom fields and full-text search.

## 🔗 Repository
https://github.com/Ramshad03/employee-card

## 🚀 Features

### 👥 Employee Management
- Add, edit, and delete employee cards
- Upload and crop profile photos
- 📷 Webcam capture support (desktop & mobile)
- Custom Employee ID and Name display on cards
- Add unlimited custom fields per employee
- Document storage & viewer for ID Card, Residence Card, Offer Letter, Driver's License, Visa and Family/Marital status documents (image or PDF)
- Salary field with currency selection
- Join date tracking with duration display
- Annual leave tracking with status indicators
- Grant leave and extend leave date support
- Total leave taken calculation
- Visa expiry tracking with color-coded urgency levels
- Status color border on profile photo (see Color Guide below)
- Filter employees by status (Active, Visa Expired, Visa Expiring, Visa Due Soon, On Leave)
- Full-text search across name, IDs, contact info, documents and custom fields
- Export employee data as CSV
- Clickable employee cards with full detail page

### 🚗 Vehicle Management
- Add, edit, and delete vehicle cards with photo crop
- Vehicle status tracking: Active, In Service, Under Maintenance, Inactive
- Mulkiya (registration) and insurance tracking with expiry status indicators
- Document viewer for Mulkiya and insurance documents
- Assign a driver from the employee list
- Damage report log with file uploads and viewer
- Complaints log with file uploads and viewer
- Fine management: add fines, mark as paid/unpaid, view fine history, download fine records
- Add unlimited custom fields per vehicle
- Filter vehicles by status and document expiry (Mulkiya/Insurance expired, expiring or due soon)
- Full-text search across vehicle details and custom fields
- Export vehicle data as CSV

### 🎨 General / UI
- Notification panel with unread/read state for visa, leave and document expiry alerts
- Dark / light theme toggle
- Glassmorphism navigation, ribbon bookmark labels and glow status borders
- Built-in color guide / help overlay explaining all status colors
- Data stored in local JSON files

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Storage:** JSON files (`employees.json`, `vehicles.json`)
- **Libraries:** Cropper.js (photo cropping)

## 📁 Project Structure
```
employee-card/
│
├── backend/
│   ├── server.js              # Express server & API routes
│   ├── employees.json         # Employee data storage
│   └── vehicles.json          # Vehicle data storage
│
├── frontend/
│   ├── employees.html         # Employee directory page
│   ├── employee-detail.html   # Employee detail page
│   ├── vehicles.html          # Vehicle directory page
│   ├── vehicle-detail.html    # Vehicle detail page
│   ├── style.css              # Styling
│   ├── app.js                 # Employee frontend logic
│   ├── vehicle-app.js         # Vehicle frontend logic
│   └── notifications.js       # Notification panel logic
│
├── .gitignore
├── package.json
└── README.md
```

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

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | Get all employees |
| POST | /api/employees | Add new employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| GET | /api/employees/export | Export employees as CSV |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | Get all vehicles |
| GET | /api/vehicles/:id | Get a single vehicle |
| POST | /api/vehicles | Add new vehicle |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |

### Shared
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload photo (returned as base64) |

## 🎯 Status Color Guide

### Employee cards
| Color | Meaning |
|-------|---------|
| 🟢 Green | Active — visa valid (more than 90 days left) |
| 🟡 Yellow | Visa due soon — expiring within 90 days |
| 🟠 Orange | Visa expiring soon — within 45 days |
| 🔴 Red | Visa expired |
| ⚫ Grey | Currently on leave |

### Vehicle cards
| Color | Meaning |
|-------|---------|
| 🟢 Green | Active & documents valid |
| 🔵 Blue | In Service |
| 🟠 Orange | Under Maintenance / documents expiring soon |
| 🟡 Yellow | Documents due soon |
| 🔴 Red | Inactive / Mulkiya or insurance expired |

## 🏖️ Leave Tracking Logic
- Leave automatically resets after the granted leave period ends
- Extend leave by setting an "Extend Leave Until" date
- Total leave taken is calculated and displayed on the detail page
- An employee shows as "On Leave" (grey) between the granted date and the leave end date

## 📌 Notes
- All employee data is stored in `backend/employees.json` and all vehicle data in `backend/vehicles.json`
- Photos and documents are stored as base64 strings inside the JSON files
- The system is designed for local/internal network use
- Camera access requires browser permission (allow camera in browser settings)
- Future upgrade: Replace JSON storage with a proper database (MongoDB/SQLite)

## 👤 Author
Ramshad03
