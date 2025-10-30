# Backend Connection Troubleshooting

## Issue: HTTP 404 Error

If you're getting a `404` error when trying to register or login, it means the frontend can't reach the backend API.

## Quick Checks

1. **Is the backend server running?**

   ```bash
   cd ../receipt_processor
   cargo run
   ```

   You should see output like:

   ```
   Server running on http://0.0.0.0:8000
   ```

2. **Check the browser console** for these logs:

   ```
   ApiClient: Making request to URL: http://localhost:8000/auth/register
   ApiClient: Base URL: http://localhost:8000
   ```

3. **Is the environment variable set correctly?**
   ```bash
   cat .env.local
   ```
   Should show:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Common Issues

### 1. Backend Server Not Running

**Symptom:** `Failed to fetch` or `Network error`

**Solution:**

```bash
cd receipt_processor
cargo run
```

### 2. Wrong URL Configuration

**Symptom:** 404 errors, logs show incorrect base URL

**Solution:**

- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Restart the Next.js dev server after changing env vars

### 3. CORS Issues

**Symptom:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**

- Check the Rust backend has CORS configured
- Look for CORS middleware in `receipt_processor/src/main.rs`

### 4. Endpoint Not Found

**Symptom:** 404 error with correct base URL

**Solution:**

- Check that the backend has the endpoint registered
- Verify the path matches: `/auth/register`, `/auth/login`, etc.

## Verify Backend is Working

Test the backend directly:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test register endpoint
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Debug Steps

1. **Check the exact URL being called:**
   Look in browser console for `ApiClient: Making request to URL:`

2. **Verify backend is responding:**
   Open `http://localhost:8000/health` in your browser

3. **Check network tab:**

   - Open DevTools → Network
   - Try to register/login
   - Look at the failed request
   - Check the Request URL and Status Code

4. **Restart both servers:**

   ```bash
   # Terminal 1: Backend
   cd receipt_processor
   cargo run

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Expected Behavior

When everything is working correctly:

1. **Registration:**

   - User fills form at `/auth/register`
   - Frontend calls `POST http://localhost:8000/auth/register`
   - Backend returns JWT token
   - User is redirected to dashboard

2. **Login:**
   - User fills form at `/auth/login`
   - Frontend calls `POST http://localhost:8000/auth/login`
   - Backend returns JWT token
   - User is redirected to dashboard

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Check the backend logs for incoming requests
3. Verify the `NEXT_PUBLIC_API_URL` environment variable is loaded correctly
