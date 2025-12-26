# 🎬 Movie Management System (Node.js + MongoDB)

A full-stack movie management web application that allows users to register, log in, search for movies, add favorites, write reviews, and share links publicly or privately. The project includes user and admin roles, with protected pages and stored data in MongoDB.

> Based on a project originally developed by **Mongd Amasha** & **Jawad Ayoub**.

---

## 🚀 Features

### 👤 User Features
- Register / Login system (users stored in MongoDB)  
- Search for movies by name  
- View movie details + add review and link  
- Mark links as **public** (visible to everyone) or **private**  
- Save favorite movies and remove them from favorites list  
- Logout and session handling  

### 🔐 Admin Features
- Access to **Admin Panel** (restricted)
- View all links created by users
- Manage and delete inappropriate links

---

## 🗃️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Backend | Node.js |
| Database | MongoDB |
| Frontend | HTML, CSS |
| Auth | Session-based login |
| Data Storage | CRUD operations in MongoDB |

---

## 📂 Pages (from the original project)
| Page | Description |
|------|-------------|
| Login / Register | Authenticate and create accounts |
| Home | Search and browse movies |
| Movie Details | Add review & public/private link |
| Favorites | List of saved movies for each user |
| Public Movies | Public shared links + click counter |
| Admin Panel | Manage public links (Admin only) |

---

## 📸 Screenshots
Screenshots are included in the `screenshots/` folder:
- Login page
- Movie search
- Movie details & link system
- Favorites page
- Public movies page
- Admin panel

---

## 🛠 Database Structure (MongoDB)
The project stores:
- Users
- Favorites (with movie details)
- Public/private links + click count

---

## 🎯 Project Status
This is a **learning project** to demonstrate:
- Backend & database integration
- Authentication logic
- CRUD operations
- Admin vs user access control

It is ready to be published as a portfolio project.

---