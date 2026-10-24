# MyStore

Enterprise-Grade Independent App Download and Distribution Platform for Android APK and iOS Applications.

## 🚀 Features

- **Storefront & Discovery**: Sleek, animated modern UI with responsive dark/light mode, category filters, and real-time search.
- **Direct Android APK Sideload**: 1-click resumable downloads with SHA-256 cryptographic checksum verification.
- **iOS OTA Distribution**: Support for iOS Enterprise and Ad-Hoc `itms-services` manifest profiles.
- **Platform Master Switch**: Super Admin toggle to enable/disable iOS applications and features across the entire platform in real-time.
- **Super Admin Console**: Restricted portal accessed via `/login` to manage applications, categories, and binary version uploads.
- **Backend Architecture**: Spring Boot 3 + Spring Data MongoDB + S3/MinIO cloud storage integration.
- **Database**: MongoDB Atlas cloud cluster with real-time collections (`apps`, `categories`, `users`).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Axios, React Router v7
- **Backend**: Spring Boot 3, Java 23, Spring Security, JWT, Spring Data MongoDB
- **Database**: MongoDB Atlas

## 📦 Setup & Run

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
mvn spring-boot:run
```
