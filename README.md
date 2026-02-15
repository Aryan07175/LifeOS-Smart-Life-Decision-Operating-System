# LifeOS-A-Smart-Life-Decision-Operating-System.
LifeOS is a platform that helps users track decisions, analyze long-term outcomes, and get AI-assisted guidance for future choices
# LifeOS - Smart Life Decision Operating System

> Track decisions, analyze long-term outcomes, and get AI-assisted guidance for future choices.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## 🎯 Overview

**LifeOS** is an intelligent decision-tracking platform that helps users make better life choices by learning from their past decisions. Unlike traditional journaling apps, LifeOS systematically tracks decision outcomes over time and uses AI to provide personalized guidance based on your unique decision-making patterns.

### The Problem

People make critical decisions every day:
- **Career moves** (job changes, promotions, skill investments)
- **Financial choices** (investments, major purchases, savings strategies)
- **Health & habits** (diet changes, exercise routines, lifestyle adjustments)
- **Relationships** (personal and professional)

But we rarely track whether these decisions actually worked out. LifeOS answers:

> **"Was this decision actually good for me over time?"**

---

## ✨ Core Features

### 1. **Decision Tracking**
- Record decisions with full context (reasoning, expectations, confidence level)
- Categorize by type (career, financial, health, relationships, etc.)
- Tag and link related decisions
- Capture decision-making frameworks used

### 2. **Outcome Monitoring**
- Scheduled check-ins (1 week, 1 month, 3 months, 6 months, 1 year)
- Track satisfaction scores over time
- Record quantitative metrics (salary changes, weight loss, etc.)
- Capture qualitative reflections

### 3. **Analytics & Insights**
- Personal decision dashboard with success metrics
- Pattern recognition across decision categories
- Correlation analysis (confidence vs. actual outcomes)
- Time-series visualization of decision quality
- Comparative analysis between similar decisions

### 4. **AI-Powered Guidance**
- Conversational AI advisor for decision exploration
- Similarity search to find "decisions like this one"
- Personalized decision frameworks based on your history
- Pattern-based recommendations
- Questions to consider before deciding

### 5. **Smart Notifications**
- Automated reminder system for outcome check-ins
- Context-aware prompts based on decision timeline
- Email and push notification support

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web App    │  Mobile App  │  Browser Ext │   API/SDK      │
│  (Next.js)   │(React Native)│  (Optional)  │ (Public API)   │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│         (Authentication, Rate Limiting, Routing)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MICROSERVICES LAYER                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Decision   │   Outcome    │  Analytics   │   AI Engine    │
│   Service    │   Tracking   │   Service    │   Service      │
│              │   Service    │              │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  PostgreSQL  │    Redis     │  Vector DB   │   S3/GCS       │
│ (Primary DB) │   (Cache)    │ (Embeddings) │  (Storage)     │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Core Microservices

#### **Decision Service**
Manages the complete lifecycle of decisions:
- CRUD operations for decisions
- Decision categorization and tagging
- Context and metadata storage
- Decision linking and relationships

#### **Outcome Tracking Service**
Handles outcome monitoring:
- Check-in scheduling and reminders
- Satisfaction score tracking
- Metrics collection (quantitative & qualitative)
- Historical outcome data

#### **Analytics Service**
Generates insights and patterns:
- Aggregated decision statistics
- Pattern recognition across categories
- Success metric calculations
- Trend analysis and visualization data

#### **AI Engine Service**
Powers intelligent features:
- LLM-based conversational advisor
- Semantic similarity search
- Pattern analysis and ML predictions
- Personalized recommendation generation

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14+ (React 18, TypeScript)
- **State Management:** Zustand + React Query
- **UI Components:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts / Chart.js
- **Mobile:** React Native (iOS & Android)

### Backend
- **Decision/Outcome/Analytics Services:** Node.js (TypeScript) with Express/Fastify
- **AI Engine Service:** Python 3.11+ with FastAPI
- **API Gateway:** Kong / AWS API Gateway
- **Authentication:** JWT + OAuth 2.0

### Databases & Storage
- **Primary Database:** PostgreSQL 15+ (with pgvector extension)
- **Cache Layer:** Redis 7+
- **Vector Database:** Pinecone (managed) or Weaviate (self-hosted)
- **Object Storage:** AWS S3 / Google Cloud Storage
- **Search:** Elasticsearch (optional for advanced search)

### AI/ML Stack
- **LLM:** Claude API (Anthropic) / OpenAI GPT-4
- **Embeddings:** OpenAI text-embedding-3-small
- **ML Framework:** Scikit-learn, PyTorch
- **MLOps:** MLflow for experiment tracking

### Infrastructure
- **Cloud Provider:** AWS / GCP / Azure
- **Container Orchestration:** Kubernetes (EKS/GKE) or Docker Compose for development
- **CI/CD:** GitHub Actions
- **Monitoring:** Datadog / Prometheus + Grafana
- **Logging:** ELK Stack or Loki

### Message Queue & Jobs
- **Queue:** Redis Bull (Node.js) or Celery (Python)
- **Scheduler:** node-cron / APScheduler

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Docker** & Docker Compose
- **PostgreSQL** 15+
- **Redis** 7+
- API keys for:
  - Claude API or OpenAI API
  - Pinecone (or set up local Weaviate)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/lifeos.git
   cd lifeos
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure with Docker Compose**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Install dependencies**
   
   Backend services:
   ```bash
   cd services/decision-service
   npm install
   
   cd ../outcome-service
   npm install
   
   cd ../analytics-service
   npm install
   
   cd ../ai-engine
   pip install -r requirements.txt
   ```

   Frontend:
   ```bash
   cd apps/web
   npm install
   ```

5. **Run database migrations**
   ```bash
   cd services/decision-service
   npm run migrate
   ```

6. **Start development servers**
   
   In separate terminal windows:
   ```bash
   # Decision Service (port 3001)
   cd services/decision-service
   npm run dev
   
   # Outcome Service (port 3002)
   cd services/outcome-service
   npm run dev
   
   # Analytics Service (port 3003)
   cd services/analytics-service
   npm run dev
   
   # AI Engine (port 8000)
   cd services/ai-engine
   uvicorn main:app --reload
   
   # Web Frontend (port 3000)
   cd apps/web
   npm run dev
   ```

7. **Access the application**
   - Web App: http://localhost:3000
   - API Docs: http://localhost:8000/docs (AI Engine)

---

## 📁 Project Structure

```
lifeos/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities and helpers
│   │   │   └── hooks/         # Custom React hooks
│   │   └── package.json
│   │
│   └── mobile/                # React Native mobile app
│       ├── src/
│       └── package.json
│
├── services/
│   ├── decision-service/      # Decision management (Node.js)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── outcome-service/       # Outcome tracking (Node.js)
│   │   └── src/
│   │
│   ├── analytics-service/     # Analytics & insights (Node.js)
│   │   └── src/
│   │
│   └── ai-engine/            # AI/ML service (Python)
│       ├── api/
│       ├── models/
│       ├── services/
│       └── requirements.txt
│
├── packages/                  # Shared packages
│   ├── shared-types/         # TypeScript type definitions
│   ├── ui-components/        # Shared UI components
│   └── utils/                # Common utilities
│
├── infrastructure/
│   ├── docker/               # Dockerfiles
│   ├── kubernetes/           # K8s manifests
│   └── terraform/            # Infrastructure as Code
│
├── docs/                     # Documentation
│   ├── architecture/
│   ├── api/
│   └── user-guides/
│
├── scripts/                  # Utility scripts
│   ├── seed-data.js
│   └── run-migrations.sh
│
├── docker-compose.yml        # Local development setup
├── .env.example             # Environment variables template
└── README.md
```

---

## 💻 Development Workflow

### Branch Strategy

We follow **GitFlow**:
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes
- `release/*` - Release preparation

### Commit Convention

We use **Conventional Commits**:
```
feat: add decision similarity search
fix: resolve outcome reminder timezone issue
docs: update API documentation
refactor: optimize analytics query performance
test: add unit tests for AI engine
chore: update dependencies
```

### Code Quality

- **Linting:** ESLint (TypeScript) + Pylint (Python)
- **Formatting:** Prettier (TypeScript) + Black (Python)
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest (Node.js) + Pytest (Python)
- **Coverage Target:** 80%+

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/decision-service
npm test

# Run tests with coverage
npm run test:coverage

# Python tests
cd services/ai-engine
pytest --cov=.
```

### Code Review Guidelines

1. All PRs require at least 1 approval
2. PRs should be < 500 lines when possible
3. Include tests for new features
4. Update documentation for API changes
5. Ensure CI passes before requesting review

---

## 📚 API Documentation

### Base URLs

- **Development:** http://localhost:3000/api
- **Staging:** https://staging-api.lifeos.app
- **Production:** https://api.lifeos.app

### Authentication

All API requests require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Decisions

```http
POST   /api/v1/decisions
GET    /api/v1/decisions
GET    /api/v1/decisions/{id}
PATCH  /api/v1/decisions/{id}
DELETE /api/v1/decisions/{id}
```

#### Outcomes

```http
POST   /api/v1/outcomes
GET    /api/v1/outcomes?decision_id={id}
GET    /api/v1/outcomes/pending-checkins
POST   /api/v1/outcomes/schedule-checkin
```

#### Analytics

```http
GET /api/v1/analytics/summary
GET /api/v1/analytics/patterns?category=career
GET /api/v1/analytics/decision-quality-over-time
```

#### AI Engine

```http
POST /api/v1/ai/analyze-decision
POST /api/v1/ai/recommend-approach
GET  /api/v1/ai/similar-decisions?decision_id={id}
POST /api/v1/ai/chat
```

**Full API documentation:** [docs/api/README.md](docs/api/README.md)

---

## 🚢 Deployment

### Development Environment

Uses Docker Compose for local development:
```bash
docker-compose up
```

### Staging/Production

#### Using Kubernetes

1. **Build Docker images**
   ```bash
   docker build -t lifeos/decision-service:latest ./services/decision-service
   docker build -t lifeos/ai-engine:latest ./services/ai-engine
   # ... repeat for other services
   ```

2. **Push to container registry**
   ```bash
   docker push lifeos/decision-service:latest
   ```

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f infrastructure/kubernetes/
   ```

#### Environment Variables

Key configuration (see `.env.example` for full list):

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/lifeos
REDIS_URL=redis://host:6379

# AI Services
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Services
DECISION_SERVICE_URL=http://decision-service:3001
OUTCOME_SERVICE_URL=http://outcome-service:3002
ANALYTICS_SERVICE_URL=http://analytics-service:3003
AI_ENGINE_URL=http://ai-engine:8000
```

### CI/CD Pipeline

GitHub Actions workflow:
1. **Lint & Test** - On every PR
2. **Build** - Build Docker images
3. **Deploy to Staging** - On merge to `develop`
4. **Deploy to Production** - On merge to `main` (with approval)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup for Contributors

```bash
# Install pre-commit hooks
npm run prepare

# Run linting
npm run lint

# Format code
npm run format

# Run type checking
npm run type-check
```

---

## 🔒 Security

### Reporting Vulnerabilities

Please report security vulnerabilities to security@lifeos.app. Do not open public issues for security concerns.

### Security Measures

- **Data Encryption:** All data encrypted at rest and in transit (TLS 1.3)
- **Authentication:** JWT tokens with short expiry + refresh token rotation
- **Authorization:** Role-based access control (RBAC)
- **API Security:** Rate limiting, input validation, SQL injection prevention
- **Privacy Compliance:** GDPR and CCPA compliant
  - Right to data export
  - Right to be forgotten (complete data deletion)
  - Data anonymization for analytics
- **Audit Logging:** All data access and modifications logged
- **Dependency Scanning:** Automated vulnerability scanning with Snyk

### Data Privacy Principles

1. **No training on user data** without explicit consent
2. **Anonymized analytics** - Personal data never leaves user context
3. **User data ownership** - Export and delete anytime
4. **Transparent AI** - Clear explanation of how AI uses your data

---

## 📊 Project Roadmap

### Phase 1: MVP (Months 1-2)
- [x] User authentication
- [x] Decision CRUD
- [x] Basic outcome tracking
- [x] Simple analytics dashboard
- [ ] AI chat advisor (basic)

### Phase 2: Core Features (Months 3-4)
- [ ] Advanced analytics with pattern recognition
- [ ] Decision similarity search
- [ ] Mobile app (iOS & Android)
- [ ] Scheduled reminders system
- [ ] Data export functionality

### Phase 3: Intelligence (Months 5-6)
- [ ] ML-based outcome predictions
- [ ] Personalized decision frameworks
- [ ] Integration with external services (calendar, health apps)
- [ ] Advanced visualization dashboards

### Phase 4: Scale & Social (Months 7-8)
- [ ] Anonymous decision sharing
- [ ] Community insights (aggregated patterns)
- [ ] Decision templates marketplace
- [ ] API for third-party integrations

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



## 🙏 Acknowledgments

- Inspired by decision science research and behavioral economics
- Built with love using open-source technologies
- Thanks to all contributors and early users

---

## 📞 Contact & Support

- **Website:** https://lifeos.app
- **Documentation:** https://docs.lifeos.app
- **Email:** support@lifeos.app
- **Twitter:** [@lifeos_app](https://twitter.com/lifeos_app)
- **Discord:** [Join our community](https://discord.gg/lifeos)

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/your-org/lifeos?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-org/lifeos?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-org/lifeos)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-org/lifeos)

---

**Made with ❤️ by the LifeOS Team**

*Help people make better decisions, one choice at a time.*
