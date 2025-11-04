# SwapStop – Sprint 3 Test Plan

## 1. Objective
This sprint focuses on testing and validating the newly added **Docker deployment pipeline**, **messaging functionality**, **login system**, and **frontend UI improvements**.  
The goal is to ensure these new features are stable, integrated correctly, and deploy reliably through the Docker-based CI/CD workflow.

---

## 2. Testing Methodologies

### a. Deployment Testing (Docker + CI/CD)
**Purpose:** Validate that the application builds, runs, and deploys successfully through Docker Compose and GitHub Actions.  
**Scope:**
- Backend and frontend containers build without errors.
- `docker compose up -d` launches both services correctly.
- Frontend connects to backend API via environment variables.
**Tools:** Docker Compose, GitHub Actions, local Ubuntu VM.
**Automation:** GitHub workflow automatically builds and runs `docker compose build` on every push.

---

### b. Login Functionality Testing
**Purpose:** Ensure that authentication works across the frontend and backend layers.  
**Scope:**
- User can register, log in, and stay logged in.
- Invalid credentials return proper error messages.
- Token expiration and session management validated.
**Tools:** `pytest`, FastAPI TestClient, browser manual testing.
**Tests:**
- `POST /users/` → creates user.
- `POST /login` → returns JWT.
- `GET /protected` → 200 if valid token, 401 if invalid.
**Automation:** Backend test suite executed through CI/CD workflow.

---

### c. Messaging Feature Testing
**Purpose:** Confirm that message creation, retrieval, and real-time updates work correctly.  
**Scope:**
- Messages persist in the database.
- Correct sender/receiver association.
- Message order and timestamps correct.
- UI updates automatically on message send.
**Tools:** FastAPI TestClient (backend), React local state testing (`vitest` or manual test), Docker environment.
**Test Examples:**
- `POST /messages/` creates a new message.
- `GET /messages/{conversation_id}` returns ordered messages.
**Manual Tests:**
1. User A → sends message to User B.
2. User B → receives message instantly on refresh.
3. Network disconnect → reconnection restores previous chat history.

---

### d. Frontend User Interface Testing
**Purpose:** Validate that new frontend components (login model, messaging UI, navigation, responsive design) render and behave correctly.  
**Scope:**
- UI renders consistently in browsers and on mobile.
- Navigation tabs update state correctly.
- Login model and message windows align with color scheme and theme.
**Tools:** `vitest`, Chrome DevTools, manual exploratory tests.
**Test Scenarios:**
1. Load `/login` → model appears centered, blur background applied.
2. Enter credentials → redirects to dashboard.
3. Open messages → messages display with correct alignment.
4. Logout → session cleared, redirect to login.

---

## 3. Resource and Schedule Planning

| Week | Testing Activities | 
|------|--------------------|--------------|
| Week 7 | Configure Docker Compose tests in GitHub Actions | 
| Week 8 | Backend login + message endpoint testing |
| Week 9 | Frontend component and UI validation | 
| Week 10 | Combined manual + automated regression testing |

---

## 4. Automation in CI/CD Pipeline
- Docker images for backend and frontend are built and tested automatically on every push.  
- Backend smoke tests run with `pytest -v` inside the container.  
- Frontend build verified with `npm run build` inside its Docker image.  
- Workflow fails if any build or test step returns non-zero status.  
- Logs from both services are uploaded as artifacts in GitHub Actions for debugging.

---

## 5. Metrics for Success

| Metric | Target | Validation Method |
|---------|---------|------------------|
| Docker build success rate | 100% | GitHub Actions logs |
| Login API reliability | 100% valid token flow | Pytest results |
| Message delivery accuracy | 100% correct sender/receiver mapping | Integration tests |
| Frontend responsiveness | ≤ 2 seconds render | Lighthouse/DevTools |
| CI/CD pass rate | 100% green builds | GitHub Actions badge |

---

## 6. Justification of Methodologies
- **Docker deployment testing** validates CI/CD stability and deployment consistency across environments.  
- **Login and messaging tests** directly target high-impact user-facing features.  
- **Frontend testing** ensures new UI enhancements and state management work visually and functionally.  
- **Automation integration** reinforces continuous verification with every commit.

---

## 7. Risks and Mitigation

| Risk | Mitigation |
|------|-------------|
| Docker build fails in CI | Use build cache + smaller base images |
| Token/session errors | Add automated invalid token test |
| Message order inconsistency | Validate database query ordering by timestamp |
| UI misalignment | Responsive testing on Chrome, Safari, Android |

---
