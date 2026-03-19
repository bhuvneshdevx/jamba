# NexStudy — Engineering Study Hub

NexStudy is an advanced, centralized platform engineered specifically for the academic needs of engineering students. It provides a robust, highly performant repository for diverse study materials including typed lecture notes, handwritten topper notes, previous year question papers (PYQs), and detailed syllabi.

The project is architected with a **"Framework-Free, Feature-Rich"** philosophy, utilizing modern ES6+ JavaScript, Web Components, and a serverless backend powered by **Supabase** (PostgreSQL) and Cloudinary.

---

## 🚀 Technical Stack & Specifications

### Frontend Architecture
- **Language:** ES6+ JavaScript (Modular).
- **Component Engine:** Native Web Components (Custom Elements API).
- **Styling:** Vanilla CSS3 with a comprehensive Design System (1600+ lines of specialized UI logic).
- **Responsive Design:** Mobile-first approach using CSS Grid, Flexbox, and `clamp()` for fluid typography.
- **Animations:** Orchestrated via `IntersectionObserver` for scroll-triggered effects and standard CSS `@keyframes`.

### Backend & Infrastructure
- **Hosting:** Vercel (Optimized global edge CDN).
- **Database:** Supabase (PostgreSQL Postgres database via REST API).
- **Authentication:** Supabase Auth (Google OAuth & Email/Password).
- **Media Management:** Cloudinary (for secure file hosting, automatic format optimization, and bandwidth efficiency).
- **API Integration:** Direct browser-to-Cloudinary uploads via unsigned presets.

---

## 🎨 Design System & UI/UX

### Core Tokens (CSS Variables)
Located at the `:root` of `styles.css`:
- **Color Palette:**
  - Backgrounds: `--bg-primary: #0a0a0f`, `--bg-secondary: #12121a`.
  - Accents: Indigo (`#6366f1`), Violet (`#8b5cf6`), Pink (`#ec4899`), Emerald (`#10b981`).
- **Glassmorphism:** Deep frosted glass (`backdrop-filter: blur(24px)`) integrated deeply into layout cards.
- **Typography:** 
  - Headings: `Outfit` (800-900+ weight) styled with Silicon Valley Brutalist negative letter-spacing.
  - Body: `Inter` (300-900 weight).
- **Transitions:** Optimized durations from `--transition-fast (0.15s)` to `--transition-spring (0.4s)`.

### Key UI Features
- **Dynamic Theming:** Ambient mesh gradients, subtle gradient overlays, and glowing background "orbs".
- **Interactive States:** "Cinematic Focus" depth-of-field hovering effects, pulse-glow animations, and smooth scrolling.
- **Custom Components:**
  - `<app-navbar>`: Floating Mac-OS Dock styled navigation responding dynamically to mobile breakpoints.
  - `<app-footer>`: Standardized information and link repository.

---

## 🏗️ System Architecture

### 1. The Hybrid Data Model
The curriculum is managed through two layers:
- **Static Baseline (`js/modules/data.js`):** 
  - Defines the `NEXSTUDY_DATA` object.
  - Hardcoded branches and core subjects for all 4 years and 8 semesters.
- **Dynamic Extension (Supabase Database):**
  - **`custom_subjects` Table:** Allows adding new subjects (electives, minor courses).
  - **`resource_types` Table:** Allows custom taxonomies for files.
  - **`resources` Table:** The heart of the app. Stores metadata for every file:
    ```json
    {
      "title": "Data Structures Unit 1",
      "subjectId": "dsa",
      "type": "notes",
      "fileUrl": "cloudinary_url_here",
      "size": "2.4 MB",
      "created_at": "ISO Timestamp"
    }
    ```

### 2. Search & Discovery Engine
Implemented in `js/modules/app.js`:
- **Flattening Logic:** `getAllSubjects()` and `getAllResources()` functions transform the nested `NEXSTUDY_DATA` into searchable arrays. *(Note: Global search currently relies on local cached objects).*
- **Search Algorithm:** Real-time filtering across subject names, codes, and resource titles with debouncing (300ms) and regex-based highlighting.

### 3. Core Protection & Routing
- **Auth Walls:** Study materials routes block unauthenticated guests, redirecting instantly to `login.html`.
- Uses **URL Query Parameters** to maintain state without a complex SPA router.
  - `?year=X`: Handled by `year.html`.
  - `?subject=ID`: Handled by `subject.html`.

---

## 📂 Project Roadmap & Directory Map

### Root Files
- `index.html`: Multi-section landing page with Hero, Features, and Year selection.
- `login.html`: Protected gateway utilizing Google Authentication logic via Supabase Auth.
- `year.html`: Renders the semester-wise view for a specific academic year (Auth protected).
- `subject.html`: The resource discovery page with category filters (Auth protected).
- `admin.html`: Secure gateway for content managers looking for explicit admin emails dynamically embedded.
- `vercel.json`: Configuration for advanced caching and clean URL handling for Vercel edge deployment.
- `supabase-config.js`: Core ES module for initializing Database/Auth clients globally.

### Core Logic (`/js/`)
- `modules/data.js`: The definitive source for curriculum structure and helper functions.
- `modules/app.js`: Global app orchestrator (counters, scroll animations, search).
- `admin/admin-core.js`: Heavy-duty logic for Supabase database integration, bulk file processing, edit modals, and dashboard stats.
- `components/`: Pure Vanilla Web Component implementations.

---

## 🛠️ Administrative & Operational Procedures

### Content Management (The Admin Panel)
1. **Login:** Accessible via `admin.html`. Requires precise match verification embedded via logic checks and strict SQL RLS rules in Supabase.
2. **Resource Management:**
   - Supports robust **Bulk Upload** and direct integration with **Cloudinary**.
   - Ability to modify dynamically stored resources and schemas with editing modals.
3. **Database Integrity:**
   - Write requests guarded tightly by PostgreSQL RLS ensuring non-authorized packets are mathematically rejected.

### Deployment Workflow
NexStudy uses Vercel for instantaneous serverless edge deployment natively avoiding complex bundle steps.
```bash
# 1. Preview changes locally by spinning up an HTTP server

# 2. Deploy instantly to production
npx vercel --prod
```
