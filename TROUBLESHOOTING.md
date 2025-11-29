# Troubleshooting Guide

## 🔴 Login/Registration Failed - Common Issues

### Issue 1: Backend Server Not Running

**Symptoms:**
- "Login failed" or "Registration failed" error
- Error message: "Cannot connect to server"
- Network error in browser console

**Solution:**

1. **Start the backend server:**
   ```bash
   cd server
   npm install  # If not already done
   npm start
   ```

2. **Verify server is running:**
   - You should see: "Server running on port 5000"
   - Open browser: http://localhost:5000/api/auth/login (should show error, but means server is running)

3. **Check frontend .env file:**
   - Create `.env` in root directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Restart frontend:**
   ```bash
   npm start
   ```

---

### Issue 2: Port Already in Use

**Symptoms:**
- Error: "Port 5000 is already in use"
- Server won't start

**Solution:**

1. **Find and kill process:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Or change port:**
   - Edit `server/.env`:
   ```
   PORT=5001
   ```
   - Update frontend `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

---

### Issue 3: CORS Errors

**Symptoms:**
- Browser console shows CORS error
- "Access-Control-Allow-Origin" error

**Solution:**

The backend already has CORS enabled. If you still see errors:

1. **Check server.js:**
   ```javascript
   app.use(cors()); // Should be present
   ```

2. **Restart both servers**

---

### Issue 4: Wrong API URL

**Symptoms:**
- Network requests fail
- 404 errors

**Solution:**

1. **Check `.env` file exists in root:**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. **Verify in browser console:**
   - Open DevTools → Network tab
   - Check if requests go to correct URL

3. **Restart React app after changing .env**

---

### Issue 5: User Already Exists

**Symptoms:**
- Registration fails with "Username already exists"

**Solution:**

1. **Use different username**
2. **Or use existing user to login:**
   - Username: `admin`
   - Password: `password123`

---

### Issue 6: Invalid Credentials

**Symptoms:**
- Login fails with "Invalid credentials"

**Solution:**

**Use default admin account:**
- Username: `admin`
- Password: `password123`

**Or register new account:**
- Make sure password is at least 6 characters
- Fill all required fields

---

## ✅ Quick Fix Checklist

1. [ ] Backend server running? (`cd server && npm start`)
2. [ ] Frontend .env file exists? (`.env` with `REACT_APP_API_URL`)
3. [ ] Both servers restarted after changes?
4. [ ] Browser console checked for errors?
5. [ ] Using correct credentials?

---

## 🔍 Debug Steps

### Step 1: Check Backend

```bash
cd server
node server.js
```

Should see: "Server running on port 5000"

### Step 2: Test API Directly

Open browser: http://localhost:5000/api/auth/login

Should see error (but means server is accessible)

### Step 3: Check Frontend Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Try login again
6. Check if request fails

### Step 4: Verify Environment

```bash
# Check if .env exists
cat .env  # Linux/Mac
type .env  # Windows
```

---

## 🆘 Still Not Working?

1. **Clear browser cache:**
   - Ctrl+Shift+R (hard refresh)

2. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   ```

3. **Check firewall:**
   - Make sure port 5000 is not blocked

4. **Try different browser:**
   - Sometimes browser extensions cause issues

---

## 📞 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to server" | Backend not running | Start server |
| "Network Error" | Wrong API URL | Check .env file |
| "Invalid credentials" | Wrong password | Use: password123 |
| "Username already exists" | User registered | Use different username |
| "CORS error" | CORS not enabled | Already enabled, restart servers |
| "Port 5000 in use" | Another process using port | Kill process or change port |

---

## 🎯 Quick Test

**Test if everything works:**

1. Start backend:
   ```bash
   cd server
   npm start
   ```

2. Start frontend (new terminal):
   ```bash
   npm start
   ```

3. Open browser: http://localhost:3000

4. Try login:
   - Username: `admin`
   - Password: `password123`

5. Should redirect to admin dashboard!

---

**If still having issues, check browser console for specific error messages!**

