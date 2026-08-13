# Eco Connect

Eco Connect is a React Native app built with Expo for mobile-first community and service workflows.

## Tech Stack

- **App:** Expo SDK 57, React Native, Expo Router, TypeScript
- **Backend:** Supabase (Postgres, Auth, Edge Functions)

## Project Structure

```text
.
├── app/                 Expo React Native application
│   ├── app/
│   │   ├── index.tsx
│   │   ├── +html.tsx
│   │   ├── +not-found.tsx
│   │   ├── _layout.tsx
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── onboarding/
│   │   │       ├── resident-signup.tsx
│   │   │       ├── staff-login.tsx
│   │   │       └── verify.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── home.tsx
│   │       ├── profile.tsx
│   │       └── report.tsx
│   ├── components/
│   │   └── useColorScheme.ts
│   ├── constants/
│   │   └── Colors.ts
│   ├── lib/
│   │   └── supabase.ts
│   └── expo-env.d.ts
└── supabase/            Supabase local project config, database artifacts, and Edge Functions
```

## Local Development Setup

1. Install app dependencies:
   ```bash
   cd app
   pnpm install
   ```
2. Start the Expo dev server:
   ```bash
   cd app
   pnpm start
   ```
3. Run on a platform:
   ```bash
   cd app
   pnpm android
   # or
   pnpm ios
   # or
   pnpm web
   ```
4. Start Supabase local stack (from repo root):
   ```bash
   npx supabase start
   ```
5. Serve Edge Functions locally (from repo root):
   ```bash
   npx supabase functions serve
   ```

## Environment Variables

| Variable | Where used | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | App | Supabase project URL used by the Expo app. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App | Public anonymous API key for Supabase client access. |
| `SUPABASE_ACCESS_TOKEN` | GitHub Actions / Deploy | Personal access token used to deploy Edge Functions from CI. |
| `SUPABASE_PROJECT_REF` | GitHub Actions / Deploy | Supabase project reference used by deploy workflow target project. |
| `EDGE_FUNCTION_*` (example naming) | Supabase Edge Functions | Function-specific secrets (API keys/tokens) set via `supabase secrets set`, never committed. |

## CI/CD

- `ci.yml` runs on every push and pull request to `main` and performs:
  - app dependency install (`pnpm install --frozen-lockfile`)
  - lint (`pnpm lint`)
  - type check (`pnpm exec tsc --noEmit`)
- `deploy-functions.yml` deploys Supabase Edge Functions to Supabase on push to `main`.

## Contributing

- **Branch naming:** `feature/<short-description>`, `bugfix/<short-description>`, `chore/<short-description>`
- **Commit style:** Prefer Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- **Team workflow:** Scrum-based delivery with short-lived branches, PR reviews, and iterative sprint planning.

## License

License to be decided (placeholder).
