# SRM PhD - Minutes of Meeting (MoM) Module

Step-by-step guide to run the application on a fresh Windows system.

Repository: https://github.com/phddsu/srm-mom-module

---

## HOW TO VIEW THIS README ON GITHUB

1. Open browser
2. Go to https://github.com/phddsu/srm-mom-module
3. Scroll down — the README is shown below the file list

---

## STEP 1 — Install prerequisites (one time only)

Install these four tools on your Windows system:

### 1.1 Java JDK 17

Download from: https://adoptium.net/temurin/releases/?version=17
Run the installer. Use all default options.

### 1.2 Apache Maven

Download from: https://maven.apache.org/download.cgi
Choose the "Binary zip archive". Unzip it to `C:\Program Files\Apache\maven`.
Add `C:\Program Files\Apache\maven\bin` to your System PATH.

How to add to PATH:
- Press Windows key, type "environment variables"
- Click "Edit the system environment variables"
- Click "Environment Variables"
- Under "System variables", select "Path", click "Edit"
- Click "New", paste `C:\Program Files\Apache\maven\bin`
- Click OK three times

### 1.3 Node.js 18 or higher

Download from: https://nodejs.org
Run the installer. Use all default options.

### 1.4 PostgreSQL 14 or higher

Download from: https://www.postgresql.org/download/windows/
Run the installer. When it asks for a password, SET A PASSWORD and write it down.
Use the default port 5432.

### 1.5 Git

Download from: https://git-scm.com/download/win
Run the installer. Use all default options.

---

## STEP 2 — Verify installations

Open a NEW PowerShell window (press Windows key, type "powershell", press Enter).

Run these one by one. Each should print a version number.

    java -version

    mvn -version

    node -v

    npm -v

    git --version

If any command says "not recognized", re-install that tool.

---

## STEP 3 — Clone the repository

In the same PowerShell window, run:

    cd C:\

    git clone https://github.com/phddsu/srm-mom-module.git

    cd srm-mom-module

You now have the code at `C:\srm-mom-module`.

---

## STEP 4 — Create the PostgreSQL database

Run this command. Enter your PostgreSQL password when prompted.

    psql -U postgres -c "CREATE DATABASE srm_mom_prod;"

Expected output:

    CREATE DATABASE

If `psql` is not on PATH, use the full path (adjust version number):

    & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE srm_mom_prod;"

---

## STEP 5 — Start the backend (Terminal 1)

Open a NEW PowerShell window. Keep this window OPEN.

Run these commands one by one:

    cd C:\srm-mom-module\backend

If your PostgreSQL password is NOT "postgres", run this first:

    $env:DB_PASSWORD="your_actual_password"

If your PostgreSQL port is NOT 5432, run this too:

    $env:DB_PORT="5432"

Now start the backend:

    mvn spring-boot:run

Wait until you see this line:

    Tomcat started on port 8081 (http)

Flyway creates all tables automatically. DataLoader seeds 8 users.

Do NOT close this window.

---

## STEP 6 — Start the frontend (Terminal 2)

Open a SECOND PowerShell window (keep Terminal 1 running).

Run these commands one by one:

    cd C:\srm-mom-module\frontend

    npm install

Wait until npm finishes. Then:

    npm run dev

Wait until you see this line:

    Local: http://localhost:5173/

Do NOT close this window either.

---

## STEP 7 — Open the application in browser

Open Chrome or Edge. Go to:

    http://localhost:5173

You will see the SRM login page.

---

## STEP 8 — Login credentials

Use any of these accounts:

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

---

## STEP 9 — Run the full demo

### Stage 1: Scholar submits

1. Login as `scholar1` / `Scholar@123`
2. Click "+ Create New MoM"
3. Click the new MoM from the list
4. Fill tabs: A. Scholar, B. Work, C. Milestones, D. Throughputs, E. Skills, F. Challenges, G. Assistantship, Leave
5. Click "+ Attach" in any row to upload a proof file (PDF/PNG/JPG, max 10 MB)
6. Go to "Review & Submit" tab
7. Type your name: Scholar One
8. Click "Submit for Review" then tick the checkbox and click Submit

### Stage 2: Supervisor recommends

1. Logout (top-right menu)
2. Login as `guide1` / `Guide@123`
3. In the table, click "View" on the pending MoM
4. Fill Section H on the right:
   - Month: October 2026
   - Pick scores 1-5 for the 6 fields
   - Remarks: Satisfactory progress
5. Type your name: Guide One
6. Click Recommend, then confirm

### Stage 3: Coordinator recommends

1. Logout
2. Login as `coord1` / `Coord@123`
3. Click "View" on the pending MoM
4. Type remarks and name: Coordinator One
5. Click Recommend, then confirm

### Stage 4: HOI endorses

1. Logout
2. Login as `hoi1` / `Hoi@123`
3. Click "View" on the pending MoM
4. Fill Section I:
   - Certified Leave: Yes
   - Certified Fellowship: Yes
   - Remarks: Endorsed
5. Type your name: Head of Institute
6. Click Recommend, then confirm

### Stage 5: Dean approves

1. Logout
2. Login as `dean1` / `Dean@123`
3. Click "View" on the pending MoM
4. Click "Print / Download PDF" to see the generated PDF
5. Fill Directorate Remarks and type name: Dean Research
6. Click Approve, then confirm

### Stage 6: Verify completion

1. Logout
2. Login again as `scholar1` / `Scholar@123`
3. The MoM now shows DEAN APPROVED with progress at 100%

---

## TROUBLESHOOTING

| Error | Fix |
|---|---|
| Connection refused: localhost:5432 | PostgreSQL service not running. Open Windows Services, start "postgresql-x64-16" |
| password authentication failed | Wrong PostgreSQL password. Set $env:DB_PASSWORD="yourpassword" before starting backend |
| database "srm_mom_prod" does not exist | Run the CREATE DATABASE command again (Step 4) |
| Port 8081 already in use | Another app is using 8081. Kill it or change port in application.yml |
| Port 5173 already in use | Run: npm run dev -- --port 5174 |
| mvn: command not found | Maven not on PATH. Add Maven bin folder to PATH, then close and reopen PowerShell |
| npm: command not found | Node.js not installed. Re-install from nodejs.org |
| Blank page in browser | Frontend not running. Check Terminal 2 is still open |
| CORS error in browser console | Backend not running. Check Terminal 1 is still open |
| Login fails "Invalid username or password" | Backend didn't seed users. Restart backend, check Flyway migration ran |

---

## PROJECT STRUCTURE

    srm-mom-module/
    ├── backend/                     Spring Boot application
    │   ├── pom.xml
    │   └── src/main/
    │       ├── java/com/srm/phd/mom/
    │       │   ├── MomApplication.java
    │       │   ├── config/          Security, DataLoader, Exceptions
    │       │   ├── controller/      REST endpoints
    │       │   ├── dto/             Data transfer objects
    │       │   ├── entity/          JPA entities
    │       │   ├── repository/      Spring Data JPA repositories
    │       │   ├── security/        JWT auth
    │       │   └── service/         Business logic
    │       └── resources/
    │           ├── application.yml
    │           ├── db/migration/    Flyway V1-V5 SQL files
    │           └── static/srm-logo.jpg
    │
    └── frontend/                    React + Vite + Tailwind
        ├── package.json
        ├── vite.config.ts
        ├── tailwind.config.js
        ├── public/srm-logo.jpg
        └── src/
            ├── main.tsx, App.tsx
            ├── api/                 Axios clients
            ├── auth/                AuthContext
            ├── components/          Reusable components
            ├── layout/              Sidebar + header
            ├── pages/               Role dashboards
            └── types/               TypeScript types

---

## SUMMARY OF COMMANDS

Here is every command in one place for quick copy-paste.

Step 3 - Clone:

    cd C:\
    git clone https://github.com/phddsu/srm-mom-module.git
    cd srm-mom-module

Step 4 - Create database:

    psql -U postgres -c "CREATE DATABASE srm_mom_prod;"

Step 5 - Backend (Terminal 1):

    cd C:\srm-mom-module\backend
    $env:DB_PASSWORD="your_password_here"
    mvn spring-boot:run

Step 6 - Frontend (Terminal 2):

    cd C:\srm-mom-module\frontend
    npm install
    npm run dev

Step 7 - Open in browser:

    http://localhost:5173

---

## LICENSE

Internal use - SRM Institute of Science and Technology.