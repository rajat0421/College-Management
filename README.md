# CollegeMS — Smart attendance & operations without Excel

**CollegeMS helps colleges manage attendance in seconds, automatically detect low attendance, and notify students early—without spreadsheets or manual tracking.**

---

## 🚀 What makes CollegeMS different

* ⚡ **Mark attendance in seconds** — fast, simple workflow
* 🧠 **Automatic low-attendance detection** — no manual tracking
* 📩 **Instant alerts to students** — act before it’s too late
* 🏫 **Structured by branch & subject** — matches real college workflow
* 🔐 **Secure per college (multi-tenant)** — your data stays isolated

---

## 🎯 Who this is for

* Small to mid-size colleges
* Coaching institutes
* Training centers

Anyone who wants to replace **Excel + manual tracking** with a simple system.

---

## 🧠 How it works (in practice)

1. Teacher selects **branch → year → subject**
2. System loads the correct student list
3. Attendance is marked in seconds
4. CollegeMS automatically:

   * detects low attendance
   * highlights at-risk students
   * enables alerts

👉 No spreadsheets. No manual tracking.

---

## 🏢 Roles & Responsibilities

### 👨‍💼 College Administrator

Full control over structure and data:

* **Branches** — Create departments (e.g. CSE, ECE)
* **Subjects** — Define subjects per branch (all years or specific years)
* **Students** — Add students with branch & year
* **Teachers** — Create accounts (no subject assignment needed)

Admins also have access to **dashboard, reports, and alerts**.

---

### 👨‍🏫 Teachers

Focused on attendance and reporting:

* **Attendance**
  Select:

  * Branch
  * Year
  * Subject
  * Date

  Then mark attendance in seconds.

* **Smart Report**

  * View low attendance
  * Track student performance
  * Send alerts

* **Profile**

  * Manage password

👉 Teachers don’t manage system structure → reduces errors.

---

## 📊 Key Features

### ⚡ Fast Attendance

* Mark entire class quickly
* Clean and simple UI

---

### 🧠 Smart Attendance Tracking

* Detect students below threshold (e.g. 75%)
* Identify continuous absentees

---

### 📩 Alerts System

* Send notifications (email-ready)
* Helps early intervention

---

### 📤 Export Reports

* Download attendance data
* Useful for records and audits

---

### 🔍 Search & Filters

* Quickly find students
* Filter by branch, year

---

### 🔐 Role-Based Access

* Admin → full control
* Teacher → attendance + reports

---

## 🏗️ System Structure

* **Branches** → e.g. CSE, Mechanical
* **Subjects** → linked to branch (optional year rules)
* **Students** → assigned to branch + year
* **Teachers** → login accounts
* **Attendance** → subject-based, date-wise tracking

---

## 🔐 Data Safety

* Multi-tenant system (data scoped per college)
* Role-based access control
* Attendance stored with:

  * markedBy
  * timestamps
  * academic year

---

## ⚙️ Tech Stack

### Backend

* Node.js
* Express
* MongoDB (Mongoose)
* JWT Authentication

### Frontend

* React (Vite)
* Tailwind CSS

---

## 🔧 Environment Variables

### Backend

* `MONGODB_URI`
* `JWT_SECRET`
* `CLIENT_URL`

Optional:

* Email integration (`EMAIL_API_URL`, `EMAIL_API_KEY`)

---

### Frontend

* `VITE_API_URL`

---

## 🚀 Quick Start (Local)

### Prerequisites

* Node.js 18+
* MongoDB (local or Atlas)

---

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Demo Flow (for presentation)

1. Add student
2. Mark attendance
3. Show dashboard (low attendance detection)
4. Send alert
5. Export report

👉 This is your deal-closing flow.

---

## 💰 Pricing (Suggested)

Simple monthly subscription based on institution size.

👉 Start small (₹500/month) and scale.

---

## 🎯 Product Positioning

CollegeMS is not a complex ERP.

👉 It is a
**“Smart Attendance System with Alerts for Colleges”**

---

## 📈 Future Scope

* WhatsApp alerts
* Mobile app
* Timetable integration
* Advanced analytics

---

## 🤝 Contributing

Feel free to contribute or suggest improvements.

---

## 📩 Contact

For demo or usage, reach out directly.

---

## 🧠 Final Note

CollegeMS is built to solve a real problem:

👉 **Tracking attendance should not be manual, slow, or confusing.**

With CollegeMS:

* It’s fast
* It’s smart
* It just works

---
