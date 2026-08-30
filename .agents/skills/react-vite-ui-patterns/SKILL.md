---
name: react-vite-ui-patterns
description: >-
  Modern React 19 + Vite frontend design principles, component architecture, Leaflet map integration,
  real-time Socket.IO synchronization, and responsive styling.
---

# React 19 + Vite Frontend Architecture & UI Patterns

Use this skill when building or styling client components, managing frontend state, integrating interactive maps, and synchronizing real-time websocket data in React 19.

---

## 1. Component Architecture & Principles

- **Separation of Concerns**:
  - **Presentational / UI Components**: Pure, reusable components handling rendering and user interaction (buttons, cards, badges, modals, drawers).
  - **Container / Page Components**: Handle route logic, orchestrate API calls, manage local/global state, and pass props down.
  - **Custom Hooks**: Encapsulate reusable logic (e.g. `useEmergencySocket`, `useUserLocation`, `useTriageForm`).
- **Icons & Visual Language**: Utilize `lucide-react` or `@heroicons/react` consistently with semantic colors and accessible labels.

---

## 2. Real-Time Sockets & Maps

- **Socket.IO Client (`socket.io-client`)**:
  - Manage socket connections in dedicated custom hooks or context providers to prevent memory leaks and multiple reconnect attempts.
  - Clean up event listeners in `useEffect` cleanup return functions.
- **Leaflet & React-Leaflet (`react-leaflet`, `leaflet`)**:
  - Ensure map containers have explicit dimensions (`height: 100%` or explicit `px`/`vh` heights).
  - Fix default Leaflet icon marker asset path issues when bundling with Vite.
  - Provide smooth marker updates when real-time emergency locations change.

---

## 3. Performance & Responsive UI

- **Drawer & Overlays**: Use components like `vaul` for mobile-friendly emergency drawers and swipeable sheets.
- **Micro-interactions & Polish**: Add smooth CSS transitions, active/hover states, loading skeletons, and accessible status indicators.
- **Type Safety**: Strictly type all component props, custom hook returns, and API response payloads.
