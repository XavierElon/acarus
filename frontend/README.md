# Receipt Processor Frontend

A modern receipt processing application built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd acarus/frontend
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   The `.env.local` file should contain:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-this-in-production-12345
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   **Note:** The frontend connects to the Rust backend API at `http://localhost:8000`. Make sure the backend server is running before starting the frontend.

4. **Start the development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Start the Rust backend server** (if not already running)

   ```bash
   cd ../receipt_processor
   cargo run
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔌 Backend Connection

The frontend communicates with a Rust backend API:

- **Backend URL**: `http://localhost:8000` (configured in `NEXT_PUBLIC_API_URL`)
- **API Client**: `src/lib/api-client.ts`
- **Authentication**: JWT tokens stored in localStorage
- **Endpoints**:
  - `POST /auth/login` - User authentication
  - `POST /auth/register` - User registration
  - `GET /receipts` - Fetch receipts with pagination
  - `GET /receipts/{id}` - Get receipt details
  - `GET /users` - Get user list

### Connection Status

The API client automatically handles:

- Token refresh from localStorage
- Automatic retry on network errors
- Error logging and debugging
- Fallback to empty data if backend is unavailable

## 🔐 Authentication & Mock Users

This application includes a complete mock authentication system for testing purposes.

### Available Test Users

| **User**         | **Email**             | **Password**  | **Role** | **Description**                |
| ---------------- | --------------------- | ------------- | -------- | ------------------------------ |
| **Admin User**   | `admin@example.com`   | `admin123`    | admin    | Full access to all features    |
| **Test User**    | `test@example.com`    | `password123` | user     | Standard user account          |
| **Demo User**    | `demo@example.com`    | `demo123`     | user     | Demo account for presentations |
| **John Doe**     | `john@example.com`    | `john123`     | user     | Sample user account            |
| **Jane Smith**   | `jane@example.com`    | `jane123`     | user     | Sample user account            |
| **Manager User** | `manager@example.com` | `manager123`  | manager  | Manager-level access           |
| **Guest User**   | `guest@example.com`   | `guest123`    | guest    | Limited access account         |

### Quick Login Test

1. Go to `http://localhost:3000/auth/login`
2. Use any of the credentials above
3. You'll be redirected to the dashboard upon successful login

### Adding More Mock Users

To add more test users, edit `src/lib/auth.ts` and add entries to the `mockUsers` array:

```typescript
const mockUsers = [
  // ... existing users
  {
    id: 'user-8',
    email: 'newuser@example.com',
    password: 'newpass123',
    name: 'New User',
    role: 'user'
  }
]
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── admin/             # Admin panel
│   │   ├── receipts/          # Receipt management
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── receipts/         # Receipt-specific components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configs
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── prisma/                   # Database schema (for future use)
└── generate-mock-users.js    # Mock user generator script
```

## 🎨 Styling & UI

This project uses **Tailwind CSS v3** for styling with a custom design system:

### Design System

- **Colors**: Custom CSS variables for theming
- **Components**: Reusable UI components built with Radix UI
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Built-in dark mode support

### Key UI Components

- `Button` - Styled button component
- `Card` - Container component
- `Input` - Form input component
- `Badge` - Status indicators
- `Layout` - Page layout components

## 🔧 Development Features

### Development Mode

The application includes a development mode that bypasses authentication:

1. Go to `/admin` page
2. Toggle "Developer Mode"
3. This enables mock authentication across all pages

### Hot Reloading

- **Turbopack**: Fast development builds
- **Hot Module Replacement**: Instant updates
- **TypeScript**: Real-time type checking

## 📱 Available Pages

| **Route**        | **Description**     | **Authentication Required** |
| ---------------- | ------------------- | --------------------------- |
| `/`              | Home page           | No                          |
| `/auth/login`    | Login page          | No                          |
| `/auth/register` | Registration page   | No                          |
| `/dashboard`     | Main dashboard      | Yes                         |
| `/admin`         | Admin panel         | Yes                         |
| `/receipts`      | Receipt management  | Yes                         |
| `/receipts/new`  | Add new receipt     | Yes                         |
| `/receipts/[id]` | View/edit receipt   | Yes                         |
| `/analytics`     | Analytics dashboard | Yes                         |
| `/calendar`      | Calendar view       | Yes                         |
| `/categories`    | Category management | Yes                         |
| `/settings`      | User settings       | Yes                         |

## 🛠️ Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# Mock Users
node generate-mock-users.js  # Display available test users
```

## 🔒 Authentication System

### NextAuth.js Configuration

- **Provider**: Credentials-based authentication
- **Session**: JWT-based sessions
- **Strategy**: Client-side session management
- **Mock Users**: Built-in test users for development

### Session Management

- Sessions are stored in JWT tokens
- User roles are included in session data
- Automatic redirect to login for protected routes

## 🎯 Features

### ✅ Implemented

- [x] User authentication with mock users
- [x] Responsive design with Tailwind CSS
- [x] Admin panel with dev mode toggle
- [x] Dashboard with statistics
- [x] Receipt management interface
- [x] Dark mode support
- [x] Mobile-responsive layout
- [x] TypeScript support
- [x] Hot reloading development

### 🚧 Planned Features

- [ ] Database integration with Prisma
- [ ] Real user registration/login
- [ ] Receipt upload and processing
- [ ] Analytics and reporting
- [ ] API integration with backend
- [ ] File upload functionality
- [ ] Email notifications
- [ ] User profile management

## 🐛 Troubleshooting

### Common Issues

1. **"Unable to acquire lock" error**

   ```bash
   rm -f .next/dev/lock
   pkill -f "next dev"
   bun run dev
   ```

2. **Styling not loading**

   - Ensure Tailwind CSS v3 is installed
   - Check PostCSS configuration
   - Restart the development server

3. **Authentication not working**

   - Verify `.env.local` has `NEXTAUTH_SECRET`
   - Check browser console for errors
   - Ensure mock users are properly configured

4. **Port already in use**
   ```bash
   bun run dev --port 3001
   ```

### Development Tips

- Use the **Developer Mode** toggle in `/admin` to bypass authentication
- Check browser console for helpful debug logs
- Use the mock user credentials displayed on the login page
- The application includes comprehensive error handling and loading states

## 📚 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Radix UI primitives
- **Authentication**: NextAuth.js
- **Package Manager**: Bun (or npm)
- **Development**: Turbopack for fast builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with mock users
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the mock user credentials
3. Check browser console for errors
4. Ensure all environment variables are set correctly

---

**Happy coding! 🎉**
