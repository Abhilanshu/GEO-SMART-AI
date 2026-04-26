# REQUIREMENTS: GeoSmart AI Next.js Upgrade

## 1. Functional Requirements
- **Next.js App Router**: Use the latest Next.js 15+ features for routing.
- **Express Backend Integration**: The Next.js frontend must consume APIs from the existing Node.js server.
- **Multilingual Support**: Retain Gemini Pro logic for 10+ languages.
- **Real-time Map**: Interactive crisis markers with verification status.
- **Inventory Dashboard**: Live tracking of NGO resources.
- **RBAC**: Different views for Official, NGO, and Volunteer roles.

## 2. Non-Functional Requirements
- **Performance**: < 2s initial load time via SSR.
- **Security**: JWT-based session management with HttpOnly cookies.
- **Scalability**: Architecture ready for Microservices transition.
- **UX**: Premium dark-mode aesthetics with high visual fidelity.

## 3. Technology Stack
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Existing Node.js/Express, Mongoose, Gemini Pro.
- **Data**: MongoDB.
