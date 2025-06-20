

# 🌍 Disaster Response Coordination Platform

A full-stack MERN-based platform designed to support real-time disaster monitoring, resource coordination, and social media aggregation. It integrates with **Supabase**, **Google Gemini API**, **Twitter API**, and **Indian National Disaster Management Agency Alerts** scraping for enhanced situational awareness.

## 🗂️ Project Structure

```
.
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── supabaseClient.js
│   └── server.js
├── disaster-dashboard/
│   ├── components/
│   ├── api.js
│   ├── socket.js
│   ├── App.jsx
│   └── main.jsx
├── README.md
└── .env
```

## 🚀 Features

- **🆘 Disaster Management** – Create, update, and delete disasters.
- **📡 Real-Time Social Media Feed** – Tweets fetched and updated live.
- **📍 Geospatial Resource Mapping** – Add/query support resources using PostGIS.
- **🖼️ Image Verification** – Validate disaster images with Google Gemini.
- **📑 Official Alerts** – Scraped from NDMA Sachet using Puppeteer.
- **📲 WebSockets** – Live updates for disasters,social feeds and resources.
- **🔐 Authentication** – Mock login with role-based access.
- **🧠 AI Integration** – Gemini for location & image analysis.
- **📦 Caching** – TTL cache using Supabase.

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- Supabase Project
- Gemini API Key
- Twitter API Key 

### Installation

```bash
git clone https://github.com/ABW1729/Disaster-Management-Plarform.git
cd disaster-response-platform

cd /backend
npm install

cd ../disaster-dashboard
npm install
```

### Environment Variables

#### .env (Backend)

```
SUPABASE_URL=
SUPABASE_KEY=
TWITTER_BEARER_TOKEN=
GEMINI_API_KEY=
PORT=5000
```

### Running Locally

```bash
cd backend
node server.js

cd ../disaster-dashboard
npm run dev
```

## 📡 APIs

### Auth

- `POST /login`
- `POST /logout`

### Disaster Management

- `GET /disasters`
- `POST /disasters`
- `PUT /disasters/:id`
- `DELETE /disasters/:id`

### Resources

- `GET /disasters/:id/resources`
- `POST /disasters/resources/:id`

### Social Media

- `GET /disasters/:id/social-media`

### Alerts

- `GET /disasters/:id/official-updates`

### Gemini AI

- `POST /geocode`
- `POST /disasters/:id/verify-image`
- `POST /disasters/:id/reports`
- `POST /verify/:report_id`

## 🖥️ Deployment

- Vercel Deployment
```
https://disaster-management-system-black.vercel.app
```

## 📌 Mock Users

```js
const users = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  user: { username: 'user', password: 'user123', role: 'user' }
};
```

## 📚 Tech Stack

- React, Vite, Axios, Socket.IO
- Express, Supabase, Puppeteer
- PostgreSQL (PostGIS), Gemini API


