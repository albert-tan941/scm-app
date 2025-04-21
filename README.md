# Supply Chain Management System

A web-based Supply Chain Management (SCM) system built with React, Node.js, and SQLite.

## Features

- Product Management
- Purchase Order Management
- Shipment Tracking
- User Authentication
- Role-based Access Control

## Tech Stack

- Frontend:
  - React
  - Material-UI
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - SQLite
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
```

### Running the Application

1. Start the backend server (from root directory)
```bash
npm start
```

2. Start the frontend development server (from client directory)
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Account

Username: admin
Password: admin123

## Project Structure

```
scm-app/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # Context providers
│       ├── pages/        # Page components
│       └── services/     # API services
├── routes/               # Backend API routes
├── middleware/          # Express middleware
└── server.js           # Backend entry point
```

## Version History

### v1.0.0 - Initial Release
- Basic authentication system
- Product management
- Purchase order management
- Shipment tracking
- Role-based access control

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 