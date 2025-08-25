# kunbaniflow

React-based Kanban board showcasing 2025 UI/UX trends:
- Glassmorphic cards and modal with soft shadows
- Bento-style structure with priority and deadline badges
- Micro-interactions for drag-and-drop and hover states
- Contextual deadline badges: blue (far), amber (<48h), rose (overdue)
- Accessible focus management, keyboard shortcuts, and motion-safe animations

Component source is split into modular files under `src/components` with shared helpers in `src/utils/kanban.js`. State persists to LocalStorage.

