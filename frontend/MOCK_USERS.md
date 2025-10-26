# Quick Reference - Mock Users & Receipt Data

## 🔐 Test Credentials

| **Email**             | **Password**  | **Role** | **Spending Pattern** |
| --------------------- | ------------- | -------- | -------------------- |
| `admin@example.com`   | `admin123`    | admin    | Business-focused     |
| `test@example.com`    | `password123` | user     | Typical              |
| `demo@example.com`    | `demo123`     | user     | Frequent             |
| `john@example.com`    | `john123`     | user     | Family               |
| `jane@example.com`    | `jane123`     | user     | Health-conscious     |
| `manager@example.com` | `manager123`  | manager  | Business-travel      |
| `guest@example.com`   | `guest123`    | guest    | Minimal              |

## 🧾 Receipt Data Patterns

Each user has realistic receipt data based on their spending pattern:

- **Business-focused** (Admin): Corporate expenses, professional receipts, business meals
- **Typical** (Test): Mix of personal expenses, everyday purchases
- **Frequent** (Demo): Lots of small transactions, quick purchases
- **Family** (John): Family-oriented spending, larger purchases, kid-friendly merchants
- **Health-conscious** (Jane): Health, fitness, organic, premium wellness products
- **Business-travel** (Manager): Travel, entertainment, business meals, corporate expenses
- **Minimal** (Guest): Very few receipts, simple purchases

## 🚀 Quick Start Commands

```bash
# Start development server
bun run dev

# View available mock users
node generate-mock-users.js

# View mock receipt data
node generate-mock-receipts.js

# Build for production
bun run build
```

## 📱 Key URLs

- **Login**: `http://localhost:3000/auth/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Admin Panel**: `http://localhost:3000/admin`
- **Register**: `http://localhost:3000/auth/register`
- **Mock Receipts**: `http://localhost:3000/admin/mock-receipts`

## 🛠️ Development Mode

1. Go to `/admin`
2. Toggle "Developer Mode"
3. Bypass authentication on all pages

## 📊 Receipt Data Usage

```typescript
import { mockUserReceiptData } from '@/lib/mock-user-receipts'

// Get receipts for a specific user
const userReceipts = mockUserReceiptData.getUserReceipts('user-2')

// Get receipts by category
const foodReceipts = mockUserReceiptData.getUserReceiptsByCategory('user-2', 'Food & Dining')

// Get recent receipts (last 30 days)
const recentReceipts = mockUserReceiptData.getRecentUserReceipts('user-2', 30)

// Generate all user receipts
const allReceipts = mockUserReceiptData.generateAllUserReceipts()
```

---

_Keep this handy for quick testing with realistic receipt data!_
