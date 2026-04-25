# clinicalaisafety.co.uk

Practical clinical safety training for NHS Clinical Safety Officers deploying AI-enabled digital health technologies. DCB0129, DCB0160, DTAC, PSIRF, ISO 14971 and AI safety frameworks applied in real clinical settings.

Built by Dr Doju Cheriachan — Internal Medicine Trainee, Sheffield Teaching Hospitals NHS Foundation Trust. GMC registered. CSO certified.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel-ready

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx                       Root layout with Header/Footer
  page.tsx                         Homepage
  about/page.tsx
  modules/page.tsx
  simulators/page.tsx
  simulators/hazard-log-builder/page.tsx
  resources/page.tsx
  contact/page.tsx
  not-found.tsx
  globals.css

components/
  Header, Footer, Container, Section,
  Hero, Problem, LaunchModules, ModuleCard,
  SimulatorHighlight, FrameworksGrid,
  EmailCapture, Disclaimer, PageHeader

lib/
  site.ts                          Site config, module and framework data
```

## Deployment

1. Push to GitHub.
2. Import the repo on Vercel.
3. Framework preset: Next.js. No env vars required for the MVP.
4. Deploy. Map `clinicalaisafety.co.uk` in Project → Settings → Domains.

## Architectural notes for later phases

The architecture is deliberately decoupled so backend, auth, payments, and the AI CSO Assistant can be added without restructuring:

- **Content as data** — modules and frameworks live in `lib/site.ts` today. When the library grows, migrate to MDX or a CMS without touching pages.
- **Server components by default** — every page is a server component, ready to `await` data from a database, Supabase, or a CMS without client-side rewrites.
- **Auth seam** — a future `app/(authenticated)` route group and `middleware.ts` can gate paid content without disturbing the marketing surface.
- **AI assistant seam** — the CSO Assistant will live under `app/assistant` with its own API route (`app/api/assistant/route.ts`) calling Claude. Nothing in the MVP blocks this.
- **Simulators** — the Hazard Log Builder placeholder at `app/simulators/hazard-log-builder` is where the first interactive simulator will land. Interactive simulators will be client components mounted inside the existing page shell.

## Disclaimer

Independent educational resource. Not affiliated with NHS England, MHRA, or any regulatory body. For educational use only — not a substitute for a Trust's own clinical safety processes or the judgement of a certified Clinical Safety Officer.
