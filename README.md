# TaskFlow 🚀

A production-grade full-stack team project management platform built using **React, NestJS, MySQL, and TypeORM**.

TaskFlow helps teams collaborate efficiently by enabling:

* project management
* task assignment
* progress tracking
* role-based access control
* analytics dashboards
* Kanban-style workflow management

---

# ✨ Features

## 🔐 Authentication & Authorization

* User Signup & Login
* JWT Authentication
* Protected Routes
* Persistent Sessions
* Password Hashing using bcrypt
* Role-Based Access Control (RBAC)

### Roles

#### ADMIN

* Create/Edit/Delete Projects
* Add or Remove Team Members
* Assign Tasks
* Manage All Tasks
* View Analytics Dashboard

#### MEMBER

* View Assigned Projects
* Update Assigned Tasks
* Comment on Tasks
* Track Task Progress

---

# 📋 Project Management

* Create Projects
* Update Project Details
* Delete Projects
* Add Team Members
* View Project Details
* Activity Tracking

---

# ✅ Task Management

* Create Tasks
* Assign Tasks to Members
* Update Task Status
* Delete Tasks
* Set Task Priority
* Due Date Tracking
* Search & Filters
* Pagination

## Task Status

* TODO
* IN_PROGRESS
* DONE

## Task Priority

* LOW
* MEDIUM
* HIGH

---

# 📌 Kanban Board

Trello-style drag-and-drop task management.

### Columns

* Todo
* In Progress
* Done

### Features

* Drag-and-Drop Tasks
* Real-Time UI Updates
* Smooth Interactions
* Responsive Layout

---

# 📊 Dashboard Analytics

The dashboard provides:

* Total Tasks
* Completed Tasks
* Pending Tasks
* Overdue Tasks
* Task Completion Percentage
* Recent Activities
* Project Statistics

### Charts

* Pie Chart
* Task Status Analytics
* Productivity Metrics

---

# 🔔 Notifications System

In-app notifications for:

* Task Assignment
* Status Updates
* Due Date Alerts
* Team Activity

---

# 📝 Activity Logs

Track major user actions.

### Examples

* User assigned a task
* Task moved to DONE
* Member added to project
* Project updated

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Query
* React Hook Form
* Zod
* dnd-kit
* Recharts
* react-hot-toast

## Backend

* NestJS
* MySQL
* TypeORM
* JWT Authentication
* Passport
* bcrypt
* class-validator
* class-transformer


---

# 📁 Project Structure

```bash
TaskFlow/
│
├── client/                 # Frontend Application
├── server/                 # Backend Application
├── docs/                   # Documentation
├── README.md
└── docker-compose.yml
```

---

# 🖥️ Frontend Structure

```bash
client/
│
├── src/
│   ├── assets/
│   ├── layouts/
│   ├── routes/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── store/
│   ├── validations/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
```

---

# ⚙️ Backend Structure

```bash
server/
│
├── src/
│   ├── config/
│   ├── common/
│   ├── database/
│   ├── modules/
│   ├── shared/
│   ├── main.ts
│   └── app.module.ts
```

---

# 🗄️ Database Design

## Entities

### User

```txt
id
name
email
password
role
createdAt
updatedAt
```

### Project

```txt
id
title
description
createdBy
createdAt
updatedAt
```

### Task

```txt
id
title
description
status
priority
dueDate
assignedTo
projectId
createdBy
```

### Comment

```txt
id
taskId
userId
message
```

### Notification

```txt
id
userId
message
isRead
```

---

# 🔗 API Endpoints

## Authentication APIs

```http
POST /auth/signup
POST /auth/login
GET /auth/profile
```

## Project APIs

```http
GET /projects
POST /projects
GET /projects/:id
PATCH /projects/:id
DELETE /projects/:id
```

## Task APIs

```http
GET /tasks
POST /tasks
GET /tasks/:id
PATCH /tasks/:id
PATCH /tasks/:id/status
DELETE /tasks/:id
```

## Comment APIs

```http
POST /comments
GET /comments/task/:id
```

## Dashboard APIs

```http
GET /dashboard/stats
```

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected APIs
* Role Guards
* DTO Validation
* Helmet Security
* Rate Limiting
* CORS Protection

---

# 📱 Responsive Design

The application is fully responsive and optimized for:

* Desktop
* Tablet
* Mobile Devices

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/itsharsh56/Task-Flow.git
cd Task-Flow
```

---

# 📦 Install Dependencies

## Frontend

```bash
cd client
npm install
```

## Backend

```bash
cd server
npm install
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
DATABASE_URL=
JWT_SECRET=
PORT=
CLIENT_URL=
```

## Frontend `.env`

```env
VITE_API_URL=
```

---

# ▶️ Run the Application

## Backend

```bash
cd server
npm run start:dev
```

## Frontend

```bash
cd client
npm run dev
```

---

# 🧪 Future Enhancements

* Real-Time Collaboration
* WebSocket Notifications
* File Attachments
* Calendar Integration
* Team Chat
* Dark Mode
* Email Notifications
* Audit Trails

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

# 👨‍💻 Author

## Harsh 

* GitHub: [https://github.com/itsharsh56](https://github.com/itsharsh56)

---

# ⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub.
