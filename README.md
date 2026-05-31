# 🚀 Task Manager AI

A full-stack, event-driven **Task Management System** powered by **AI-based insights**, built with a microservices architecture.

## 📐 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  React +    │────▶│  Task        │────▶│  Kafka              │
│  Vite       │◀────│  Service     │◀────│  (Event Broker)     │
│  (Frontend) │     │  (Spring)    │     └──────┬──────┬───────┘
└─────────────┘     └──────┬───────┘            │      │
                           │              ┌─────▼──┐ ┌─▼───────────┐
                           │              │  AI    │ │ Notification │
                      ┌────▼────┐         │Insight │ │ Service      │
                      │Postgres │         │Service │ └──────────────┘
                      │  (DB)   │         └────────┘
                      └─────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Java 21 + Spring Boot 3 |
| **Database** | PostgreSQL |
| **Messaging** | Apache Kafka + Zookeeper |
| **AI** | Gemini API (task analysis) |
| **Containers** | Docker + Kubernetes |
| **Design** | Glassmorphism UI |

## ✨ Features

- **Full CRUD** – Create, Read, Update & Soft-Delete tasks
- **AI-Powered Insights** – Automatic priority, category & tag assignment via Gemini API
- **Event-Driven Architecture** – Kafka events trigger real-time processing across microservices
- **Server-Side Search** – Filter tasks by priority & category directly from PostgreSQL
- **Inline Editing** – Edit all task fields (title, description, priority, status, category, tags) directly from the UI
- **Soft Delete & Recycle Bin** – Deleted tasks are archived with `CANCELLED` status, restorable anytime
- **Read More** – Long descriptions are elegantly truncated with expand/collapse toggle
- **Glassmorphism UI** – Modern, premium design with blur effects, gradients & micro-animations

## 🚀 Getting Started

### Prerequisites
- **Docker Desktop** (with Kubernetes enabled)
- **Node.js** (v18+)
- **Java 21**

### 1. Start the Backend (Kubernetes)
```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/kafka-zookeeper.yaml
kubectl apply -f k8s/task-service.yaml
kubectl apply -f k8s/ai-insight-service.yaml
```

### 2. Verify pods are running
```bash
kubectl get pods
```

### 3. Start the Frontend
```bash
cd task-frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
TASK-MANAGER/
├── task-service/          # Main REST API (Spring Boot)
├── ai-insight-service/    # AI analysis microservice
├── notification-service/  # Event-driven notifications
├── task-frontend/         # React UI (Vite)
├── k8s/                   # Kubernetes deployment manifests
└── docker-compose.yml     # Docker Compose config
```

## 📸 UI Preview

The interface features a dark-themed Glassmorphism design with:
- Gradient header & buttons
- Color-coded priority badges (🔴 HIGH, 🟠 MEDIUM, 🟡 LOW)
- Status indicators (📌 NEW, ⏳ IN PROGRESS, ✅ DONE)
- Animated hover effects & transitions

---

Made with ❤️ by [Efrat](https://github.com/efratatias)
