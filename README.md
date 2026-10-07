# SRM PhD - Minutes of Meeting (MoM) Module

A full-stack web application for SRM Institute of Science and Technology to digitize the Monthly Progress Review of full-time PhD scholars.

## Features

- 5-role approval workflow: Scholar -> Supervisor -> Institutional Research Coordinator -> Head of Institute -> Dean Research
- Scholar form with Sections A-G (Scholar Details, Research Work, Milestones, Throughputs, Skills, Challenges, Teaching Assistantship) + Leave Requests
- Proof attachment per row (PDF/JPG/PNG/DOCX, max 10 MB)
- Typed-name digital signature by every role
- In-app notifications with unread badge
- PDF generation with SRM logo + all sections + signature blocks (Dean only)
- Audit trail of every action

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 3.2.5, Java 17, PostgreSQL 16, Flyway, JWT, iText 8 |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Database | PostgreSQL (port 5432 by default) |

## Prerequisites

- Java 17 or higher
- Maven 3.9+
- Node.js 18+ and npm
- PostgreSQL 14+ running on localhost:5432

## Setup

### 1. Clone the repository

    git clone https://github.com/YOUR-USERNAME/srm-mom-module.git
    cd srm-mom-module

### 2. Create the PostgreSQL database

    psql -U postgres -c "CREATE DATABASE srm_mom_prod;"

If your PostgreSQL uses a different port or password, set environment variables before running the backend:

Windows PowerShell:

    $env:DB_HOST="localhost"
    $env:DB_PORT="5432"
    $env:DB_NAME="srm_mom_prod"
    $env:DB_USER="postgres"
    $env:DB_PASSWORD="your_password"

Linux / macOS:

    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_NAME=srm_mom_prod
    export DB_USER=postgres
    export DB_PASSWORD=your_password

### 3. Run the backend

    cd backend
    mvn spring-boot:run

Wait for: Tomcat started on port 8081.

Flyway will auto-create all tables and the DataLoader will seed 8 users.

### 4. Run the frontend

Open a second terminal:

    cd frontend
    npm install
    npm run dev

Wait for: Local: http://localhost:5173/

### 5. Open the app

Go to http://localhost:5173 in your browser.

## Login Credentials

| Role | Username | Password |
|---|---|---|
| Scholar | scholar1 | Scholar@123 |
| Scholar (2nd) | scholar2 | Scholar@123 |
| Supervisor | guide1 | Guide@123 |
| Supervisor (2nd) | guide2 | Guide@123 |
| Coordinator | coord1 | Coord@123 |
| Head of Institute | hoi1 | Hoi@123 |
| Dean Research | dean1 | Dean@123 |
| Super Admin | admin | Admin@123 |

## Workflow Demo

1. Login as scholar1 -> My MoMs -> + Create New MoM
2. Fill Sections A-G, attach proofs, type your name -> Submit for Review
3. Login as guide1 -> Pending My Action -> open the MoM -> fill Section H -> Recommend
4. Login as coord1 -> Recommend
5. Login as hoi1 -> certify leave + fellowship -> Recommend
6. Login as dean1 -> Print PDF + Approve

## Project Structure

    srm-mom-module/
    ├── backend/          Spring Boot application
    │   ├── src/main/java/com/srm/phd/mom/
    │   │   ├── config/       SecurityConfig, DataLoader, GlobalExceptionHandler
    │   │   ├── controller/   REST endpoints
    │   │   ├── dto/          Request/response DTOs
    │   │   ├── entity/       JPA entities
    │   │   ├── repository/   Spring Data repositories
    │   │   ├── security/     JWT auth
    │   │   └── service/      Business logic
    │   └── src/main/resources/
    │       ├── db/migration/ Flyway migrations (V1-V5)
    │       ├── static/       SRM logo
    │       └── application.yml
    └── frontend/         React + Vite app
        ├── public/       SRM logo, favicon
        └── src/
            ├── api/          Axios clients
            ├── auth/         AuthContext
            ├── components/   Reusable UI
            ├── layout/       Sidebar + header
            └── pages/        Role dashboards

## License

Internal use - SRM Institute of Science and Technology.