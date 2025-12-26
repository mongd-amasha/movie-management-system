# 🎬 Movie Management System

A full-stack movie management web application built with **Node.js, Express, MongoDB, and EJS**.  
Users can register, log in, search movies, save favorites, add reviews and links, and admins can manage shared content.

---

## 🚀 Features

- 👤 **User Authentication**
  - Register, login, logout
  - Passwords hashed with **bcrypt**
  - Session-based authentication using **express-session**

- 🎥 **Movie Browsing**
  - Search movies by name (via external movie API)
  - View movie details page

- ⭐ **Favorites & Reviews**
  - Save movies as favorites (per user)
  - Add review + link + description
  - Choose **public** or **private** visibility
  - Remove movies from favorites

- 🌍 **Public Links Page**
  - View all public movie links from all users
  - Each link click is tracked and counted

- 🔐 **Admin Panel**
  - Only admin users can access
  - View all user links
  - Delete inappropriate / unwanted links

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** EJS, HTML, CSS, JavaScript
- **Database:** MongoDB (with Mongoose)
- **Auth & Sessions:** express-session, bcryptjs
- **Other:** dotenv, body-parser

---

## 📂 Project Structure

```text
movie-management-system/
├─ models/
│  ├─ User.js
│  └─ Favorite.js
├─ public/
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     ├─ script.js
│     ├─ detail.js
│     └─ favorites.js
├─ views/
│  ├─ partials/
│  │  ├─ header.ejs
│  │  └─ footer.ejs
│  ├─ index.ejs
│  ├─ login.ejs
│  ├─ register.ejs
│  ├─ detail.ejs
│  ├─ favorites.ejs
│  ├─ public.ejs
│  └─ admin.ejs
├─ .gitignore
├─ app.js
├─ package.json
└─ README.md
