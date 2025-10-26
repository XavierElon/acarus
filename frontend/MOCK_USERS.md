# Quick Reference - Mock Users

## 🔐 Test Credentials

| **Email**             | **Password**  | **Role** |
| --------------------- | ------------- | -------- |
| `admin@example.com`   | `admin123`    | admin    |
| `test@example.com`    | `password123` | user     |
| `demo@example.com`    | `demo123`     | user     |
| `john@example.com`    | `john123`     | user     |
| `jane@example.com`    | `jane123`     | user     |
| `manager@example.com` | `manager123`  | manager  |
| `guest@example.com`   | `guest123`    | guest    |

## 🚀 Quick Start Commands

```bash
# Start development server
bun run dev

# View available mock users
node generate-mock-users.js

# Build for production
bun run build
```

## 📱 Key URLs

- **Login**: `http://localhost:3000/auth/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Admin Panel**: `http://localhost:3000/admin`
- **Register**: `http://localhost:3000/auth/register`

## 🛠️ Development Mode

1. Go to `/admin`
2. Toggle "Developer Mode"
3. Bypass authentication on all pages

---

_Keep this handy for quick testing!_
