src/
├── app/
│   ├── core/                         # Core module (services, guards, interceptors, utilities, etc.)
│   │   ├── components/               # Core UI components (e.g., header, footer, etc.)
│   │   ├── directives/               # Core directives (e.g., click outside, etc.)
│   │   ├── guards/                   # Guards (e.g., AuthGuard, RoleGuard, etc.)
│   │   ├── interceptors/             # Interceptors (e.g., auth token interceptor)
│   │   ├── models/                   # Core models (e.g., User, Auth-related models)
│   │   ├── pipes/                    # Core pipes (e.g., date formatting, etc.)
│   │   ├── services/                 # Core services (e.g., AuthService, ApiService, etc.)
│   │   ├── utils/                    # Utility functions (e.g., helper functions)
│   │   ├── core.module.ts            # Core module
│   │   ├── core-routing.module.ts    # Core routing (if required for global features)
│   │   └── auth.interceptor.ts       # Auth interceptor for adding JWT tokens to requests
│   │
│   ├── shared/                       # Shared module (components, pipes, directives, etc.)
│   │   ├── components/               # Shared UI components (e.g., modal, spinner, etc.)
│   │   ├── directives/               # Shared directives (e.g., input validation, tooltip)
│   │   ├── pipes/                    # Shared pipes (e.g., currency, number, etc.)
│   │   ├── services/                 # Shared services (e.g., logger service)
│   │   ├── shared.module.ts          # Shared module
│   │   ├── shared-routing.module.ts  # Shared routing (if needed)
│   │   └── forms/                    # Shared form controls (e.g., input fields, form groups)
│   │
│   ├── features/                     # Feature modules (Project, Note, Collaborator, Draft, etc.)
│   │   ├── project/                  # Project feature module
│   │   │   ├── components/           # Project-related components (e.g., project list, project details)
│   │   │   ├── models/               # Project models (e.g., Project, ProjectDetail)
│   │   │   ├── project.service.ts    # Project service
│   │   │   ├── project-routing.module.ts
│   │   │   └── project.module.ts     # Project module
│   │   │
│   │   ├── note/                     # Note feature module
│   │   │   ├── components/           # Note-related components (e.g., note editor, note list)
│   │   │   ├── models/               # Note models (e.g., Note, NoteDetail)
│   │   │   ├── note.service.ts       # Note service
│   │   │   ├── note-routing.module.ts
│   │   │   └── note.module.ts        # Note module
│   │   │
│   │   ├── collaborator/             # Collaborator feature module
│   │   │   ├── components/           # Collaborator-related components (e.g., collaborator list)
│   │   │   ├── models/               # Collaborator models (e.g., Collaborator)
│   │   │   ├── collaborator.service.ts# Collaborator service
│   │   │   ├── collaborator-routing.module.ts
│   │   │   └── collaborator.module.ts # Collaborator module
│   │   │
│   │   ├── authority/                # Authority feature module (roles, permissions)
│   │   │   ├── components/           # Authority-related components (e.g., role list, permissions)
│   │   │   ├── models/               # Authority models (e.g., Role, Permission)
│   │   │   ├── authority.service.ts  # Authority service
│   │   │   ├── authority-routing.module.ts
│   │   │   └── authority.module.ts   # Authority module
│   │   │
│   │   ├── draft/                    # Draft feature module
│   │   │   ├── components/           # Draft-related components (e.g., draft list, draft editor)
│   │   │   ├── models/               # Draft models (e.g., Draft)
│   │   │   ├── draft.service.ts      # Draft service
│   │   │   ├── draft-routing.module.ts
│   │   │   └── draft.module.ts       # Draft module
│   │   │
│   │   └── user/                     # User management feature module (if separate from Core)
│   │       ├── components/           # User-related components (e.g., profile settings)
│   │       ├── models/               # User models (e.g., UserProfile, UpdateUser)
│   │       ├── user.service.ts       # User service (for updating profile, settings)
│   │       ├── user-routing.module.ts
│   │       ├── user.module.ts        # User module (if separated)
│   │       └── user-management/      # User management-related components and logic
│   │
│   ├── app-routing.module.ts         # Main app routing module
│   ├── app.component.ts              # Root component
│   └── app.module.ts                 # Root module
│
├── assets/                           # Static assets (images, fonts, etc.)
├── styles/                           # Global styles (tailwind, custom CSS)
│   ├── tailwind.config.js            # TailwindCSS configuration
│   ├── styles.css                   # Global styles (import TailwindCSS here)
│
└── environments/                     # Environment-specific configurations
    ├── environment.ts                # Development environment configuration
    ├── environment.prod.ts           # Production environment configuration


npm install @fortawesome/fontawesome-svg-core @fortawesome/free-regular-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome@latest