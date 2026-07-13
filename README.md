# Wampeewo Ntake SS - Competency CMS

A Teacher-Student Class Management System designed for Wampeewo Ntake SS. This application manages users with role-based access, student activities (areas of interest), submissions, notes, skills, and attendance.

## Project Structure

This is a full-stack project structured into two main directories:

- `/frontend`: The web client built with React, Vite, and TailwindCSS.
- `/backend`: The REST API server built with Node.js, Express, and TypeScript.

## Technology Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6 (Role-based routing system)
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Forms:** React Hook Form
- **Build Tool:** Vite

### Backend
- **Environment:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **ORM:** Sequelize
- **Database:** MySQL (via Docker Compose) / SQLite (for local development)

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (optional, for running MySQL locally)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by adjusting the `.env` file. Key variables include:
   - `PORT`
   - `JWT_SECRET`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
4. Start the database (if using MySQL via Docker):
   ```bash
   docker compose up -d
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## API Structure Overview
The backend API exposes the following core endpoints under `/api/*`:
- `/api/auth/*` - Authentication and authorization
- `/api/aoi/*` - Areas of interest and activities
- `/api/submissions/*` - Student submissions
- `/api/notes/*` - Teacher notes
- `/api/skills/*` - Skill tracking
- `/api/attendance/*` - Class attendance records
