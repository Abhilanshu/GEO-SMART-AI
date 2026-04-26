# ROADMAP: GeoSmart AI Next.js Migration

## Milestone 1: Next.js Foundation & Core Porting

### Phase 1: Environment Setup (IN PROGRESS)
- [ ] Initialize Next.js App with Tailwind & App Router.
- [ ] Setup API Proxy to existing Express backend.
- [ ] Implement Root Layout with GeoSmart Brand Aesthetics.

### Phase 2: Component Migration
- [ ] Port `CrisisMap` (Leaflet) to Next.js.
- [ ] Port `WhatsAppBot` (Gemini Pro) to Next.js.
- [ ] Port `Dashboard` (Inventory & Alerts) to Next.js.

### Phase 3: Auth & State Management
- [ ] Implement NextAuth or custom JWT session handling in Next.js.
- [ ] Connect `AuthContext` to backend `/api/auth`.
- [ ] Secure routes based on roles (Official, NGO, Volunteer).

### Phase 4: Intelligence & Analytics
- [ ] Implement SSR for the "Live National Feed".
- [ ] Port Analytics Charts (Recharts) to the new Dashboard.
- [ ] Final visual polish & "Wow" factor.
