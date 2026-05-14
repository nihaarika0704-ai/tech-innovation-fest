# Tech Innovation Fest

A full-stack web application for managing a college tech festival — students can discover events, register for them, and organizers can manage participants through a secure admin dashboard.

---

## Screenshots

### Homepage
![Homepage](screenshots/homepage.jpg)

### Events Page
![Events](screenshots/events.jpg)

### Event Detail
![Event Detail](screenshots/event-detail.jpg)

### Registration Form
![Registration](screenshots/register.jpg)

### Admin Login
![Admin Login](screenshots/admin-login.jpg)

---

## Features

### For Students
- **Homepage** — Hero section with countdown timer to the fest, featured events, about section, and contact info
- **Events Module** — Browse all events with category filters (Coding Contest, Hackathon, AI Workshop, Robotics, Gaming Tournament, Web Development Challenge) and live search
- **Event Detail** — Full event info: description, venue, date & time, organizer, and seats available
- **Registration** — Form with name, email, roll number, department, and event selection; duplicate registration prevention

### For Organizers / Admin
- **Secure Login** — Session-based authentication (username + password)
- **Dashboard Analytics** — Total registrations and total events at a glance
- **Participant Table** — Search registrations, filter by event, delete invalid entries
- **Registration Chart** — Visual breakdown of registrations per event

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| shadcn/ui | UI component library |
| Wouter | Client-side routing |
| React Hook Form | Form management |
| Zod | Form validation schemas |
| Framer Motion | Animations |
| TanStack Query | Server state management |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 24 | Runtime |
| Express 5 | Web framework |
| TypeScript | Type safety |
| Drizzle ORM | Database ORM |
| PostgreSQL | Database |
| express-session | Admin session auth |
| Pino | Structured logging |
| Zod | Input/output validation |

### Tooling
| Tool | Purpose |
|---|---|
| pnpm workspaces | Monorepo management |
| Orval | OpenAPI → React Query hooks + Zod schemas |
| esbuild | Server bundler |

---

## Project Structure

```
tech-innovation-fest/
├── artifacts/
│   ├── tech-fest/          # React frontend (Vite)
│   │   └── src/
│   │       ├── pages/      # Home, Events, EventDetail, Register, Admin, AdminLogin
│   │       ├── components/ # Shared UI components
│   │       └── App.tsx     # Router setup
│   └── api-server/         # Express backend
│       └── src/
│           ├── routes/     # events.ts, registrations.ts, admin.ts, health.ts
│           ├── lib/        # logger.ts
│           └── app.ts      # Express app with session middleware
├── lib/
│   ├── db/                 # Drizzle ORM schema + migrations
│   │   └── src/schema/     # events.ts, registrations.ts
│   ├── api-spec/           # OpenAPI YAML spec (source of truth)
│   ├── api-client-react/   # Generated React Query hooks
│   └── api-zod/            # Generated Zod validation schemas
└── screenshots/            # App screenshots
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tech-innovation-fest.git
cd tech-innovation-fest

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file or set these environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/techfest
SESSION_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=techfest2026
```

### Database Setup

```bash
# Push the schema to your database
pnpm --filter @workspace/db run push
```

### Running the App

```bash
# Start the API server (runs on port 5000 by default)
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/tech-fest run dev
```

The app will be available at `http://localhost:5173` (or the port Vite picks).

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/events` | List all events (filter by `?category=`) |
| POST | `/api/events` | Create event (admin) |
| GET | `/api/events/:id` | Get single event |
| PATCH | `/api/events/:id` | Update event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |
| GET | `/api/events/stats/summary` | Events statistics |
| GET | `/api/registrations` | List registrations (filter by `?eventId=&search=`) |
| POST | `/api/registrations` | Register a student |
| DELETE | `/api/registrations/:id` | Delete registration (admin) |
| GET | `/api/registrations/stats/dashboard` | Admin dashboard analytics |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/me` | Current admin session |

---

## Event Categories

- Coding Contest
- Hackathon
- AI Workshop
- Robotics
- Gaming Tournament
- Web Development Challenge

---

## Admin Access

Navigate to `/admin/login` and use the configured credentials:

```
Username: admin
Password: techfest2026
```

---

## Development Notes

- The OpenAPI spec at `lib/api-spec/openapi.yaml` is the single source of truth for the API contract
- After changing the spec, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks and schemas
- Never write raw fetch calls on the frontend — use the generated hooks from `@workspace/api-client-react`
- Never use `console.log` in server code — use `req.log` (in handlers) or the `logger` singleton

---

## Recording a Demo Video

To create a walkthrough video for submission:

1. Use [OBS Studio](https://obsproject.com/) (free, Windows/Mac/Linux) or the built-in screen recorder on your OS
2. Record while navigating through: Homepage → Events page → Event detail → Registration form → Admin login → Admin dashboard
3. Show the category filter, search, and delete features in the admin panel
4. Export as MP4 and upload to GitHub as a release asset, or link a YouTube/Drive video in this README

---

## License

MIT
