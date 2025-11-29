# Setup Guide

## Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Setup Backend Environment

Create `server/.env` file:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start Backend Server

```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

### 4. Install Frontend Dependencies

```bash
npm install
```

### 5. Setup Frontend Environment

Create `.env` file in root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start Frontend

```bash
npm start
```

Application will open at `http://localhost:3000`

## Testing the Application

### Login Credentials

1. **Admin**
   - Username: `admin`
   - Password: `password123`

2. **Lender**
   - Username: `lender1`
   - Password: `password123`

3. **Borrower**
   - Username: `borrower1`
   - Password: `password123`

4. **Financial Analyst**
   - Username: `analyst1`
   - Password: `password123`

### Testing Borrower Application Update

1. Login as `borrower1`
2. Go to Dashboard
3. Create a new application (or use existing pending one)
4. Click "Update" button on a pending application
5. Modify the application details
6. Submit the updated application

## Troubleshooting

### Backend Issues

- **Port already in use**: Change PORT in `server/.env`
- **Module not found**: Run `npm install` in server directory
- **JWT errors**: Check JWT_SECRET in `.env`

### Frontend Issues

- **API connection failed**: 
  - Check if backend is running
  - Verify `REACT_APP_API_URL` in `.env`
  - Check CORS settings in server

- **Build errors**: 
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again

## Development

### Backend Development Mode

```bash
cd server
npm run dev
```

This uses nodemon for auto-reload on file changes.

### Frontend Development

The React app runs in development mode with hot-reload by default.

## Production Build

### Frontend Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Backend Production

For production, consider:
- Using a process manager (PM2)
- Setting up a database (PostgreSQL/MongoDB)
- Using environment-specific configuration
- Setting up proper logging
- Implementing rate limiting
- Adding request validation

