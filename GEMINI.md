# NexStudy — Engineering Study Hub

NexStudy is an advanced, centralized platform engineered specifically for the academic needs of engineering students. It provides a robust, highly performant repository for diverse study materials including typed lecture notes, handwritten topper notes, previous year question papers (PYQs), and detailed syllabi.

The project is architected with a **"Framework-Free, Feature-Rich"** philosophy, utilizing modern ES6+ JavaScript, Web Components, and a serverless backend powered by Firebase and Cloudinary.

---

## 🚀 Technical Stack & Specifications

### Frontend Architecture
- **Language:** ES6+ JavaScript (Modular).
- **Component Engine:** Native Web Components (Custom Elements API).
- **Styling:** Vanilla CSS3 with a comprehensive Design System (1600+ lines of specialized UI logic).
- **Responsive Design:** Mobile-first approach using CSS Grid, Flexbox, and `clamp()` for fluid typography.
- **Animations:** Orchestrated via `IntersectionObserver` for scroll-triggered effects and standard CSS `@keyframes`.

### Backend & Infrastructure
- **Hosting:** Firebase Hosting (optimized with `cleanUrls`).
- **Database:** Cloud Firestore (NoSQL) for real-time data persistence.
- **Authentication:** Firebase Auth (Email/Password) for administrative security.
- **Media Management:** Cloudinary (for secure file hosting, automatic format optimization, and bandwidth efficiency).
- **API Integration:** Direct browser-to-Cloudinary uploads via Signed/Unsigned presets.

---

## 🎨 Design System & UI/UX

### Core Tokens (CSS Variables)
Located at the `:root` of `styles.css`:
- **Color Palette:**
  - Backgrounds: `--bg-primary: #0a0a0f`, `--bg-secondary: #12121a`.
  - Accents: Indigo (`#6366f1`), Violet (`#8b5cf6`), Pink (`#ec4899`), Emerald (`#10b981`).
- **Glassmorphism:** Uses `rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(8px)`.
- **Typography:** 
  - Headings: `Outfit` (700+ weight).
  - Body: `Inter` (300-900 weight).
- **Transitions:** Optimized durations from `--transition-fast (0.15s)` to `--transition-spring (0.4s)`.

### Key UI Features
- **Dynamic Theming:** Subtle gradient overlays and "orbs" (hero section) create depth.
- **Interactive States:** Tilt effects on cards, pulse-glow animations, and smooth scroll behaviors.
- **Custom Components:**
  - `<app-navbar>`: Sticky, scroll-responsive navigation with integrated search.
  - `<app-footer>`: Standardized information and link repository.

---

## 🏗️ System Architecture

### 1. The Hybrid Data Model
The curriculum is managed through two layers:
- **Static Baseline (`js/modules/data.js`):** 
  - Defines the `NEXSTUDY_DATA` object.
  - Hardcoded branches (CSE, ECE, ME, etc.).
  - Hardcoded core subjects for all 4 years and 8 semesters.
- **Dynamic Extension (Firestore):**
  - **`custom_subjects` Collection:** Allows adding new subjects (electives, minor courses) without redeploying code.
  - **`resources` Collection:** The heart of the app. Stores metadata for every file:
    ```json
    {
      "title": "Data Structures Unit 1",
      "subjectId": "dsa",
      "type": "notes",
      "fileUrl": "cloudinary_url_here",
      "size": "2.4 MB",
      "createdAt": "serverTimestamp"
    }
    ```

### 2. Search & Discovery Engine
Implemented in `js/modules/app.js`:
- **Flattening Logic:** `getAllSubjects()` and `getAllResources()` functions transform the nested `NEXSTUDY_DATA` into searchable arrays.
- **Search Algorithm:** Real-time filtering across subject names, codes, and resource titles with debouncing (300ms) and regex-based highlighting.

### 3. Navigation & Routing
- Uses **URL Query Parameters** to maintain state without a complex SPA router.
  - `?year=X`: Handled by `year.html`.
  - `?subject=ID`: Handled by `subject.html`.
- **Breadcrumb System:** Dynamically generated based on current URL state.

---

## 📂 Project Roadmap & Directory Map

### Root Files
- `index.html`: Multi-section landing page with Hero, Features, and Year selection.
- `year.html`: Renders the semester-wise view for a specific academic year.
- `subject.html`: The resource discovery page with category filters (Notes, PYQs, etc.).
- `admin.html`: Secure gateway for content managers.
- `firebase.json`: Configuration for hosting and clean URL routing.

### Core Logic (`/js/`)
- `modules/data.js`: The definitive source for curriculum structure and helper functions.
- `modules/app.js`: Global app orchestrator (counters, scroll animations, search).
- `admin/admin-core.js`: Heavy-duty logic for Firebase integration, bulk file processing, and dashboard stats.
- `components/`: Pure Web Component implementations.

---

## 🛠️ Administrative & Operational Procedures

### Content Management (The Admin Panel)
1. **Login:** Accessible via `admin.html`. Requires valid Firebase Auth credentials.
2. **Resource Upload:**
   - Supports **Bulk Upload**.
   - Integrates with **Cloudinary Upload API**.
   - Progress tracking via XHR `onprogress` events.
3. **Curriculum Control:**
   - Add/Remove "Custom Subjects" to any semester.
   - Define new "Resource Types" with custom icons.

### Deployment Workflow
NexStudy is optimized for a **Continuous Integration** feel via Firebase CLI.
```bash
# 1. Preview changes locally
npx serve .

# 2. Synchronize curriculum changes
# Ensure data.js matches Firestore structure

# 3. Deploy to production
firebase deploy --only hosting
```

---

## 📝 Development Conventions & Best Practices

- **Component Creation:** Always use the `connectedCallback` in custom elements to inject HTML and bind events.
- **Data Integrity:** When fetching from Firestore, always use `try-catch` blocks and provide fallback UI (empty states).
- **Styling Standards:**
  - Use `var()` for all colors and spacing.
  - Never hardcode hex values outside of the `:root` variables.
- **Search Optimization:** Ensure all new subjects have a unique `id` and accurate `code` to maintain searchability.
- **Performance:** Keep file uploads under 50MB (enforced in `admin-core.js`) to ensure fast loading for end-users.
