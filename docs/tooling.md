# TravelMate Tooling & Environment Reference

**Document Version:** 1.0 (Master Rebuild)  
**Last Updated:** October 2026  
**Reference:** Section 11 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

---

## 1. CLI Tools & Runtimes

| Tool | Version / Status | Purpose in Rebuild | Notes / Operational Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.16.0` (npm `10.8.2`) | JavaScript / TypeScript runtime, Vite build system, test execution | Run commands via `cmd.exe /c "<command>"` on Windows |
| **Git** | `v2.48.1.windows.1` | Source control, daily tags (`day-N`), branch tracking | Active branch: `rebuild/route-recovery`. Baseline tag: `baseline-before-rebuild` |
| **Vercel CLI** | `v59.10.0` | Cloud deployments, previews, and environment variable synchronization | Logged in as `surendragedala6-3289`. Project: `travelmate-ai-flowzint` |
| **Docker CLI** | `v29.7.2` (build `a7dcaa6`) | Container tool for local Postgres instance | Docker CLI installed. Daemon connection (`//./pipe/dockerDesktopLinuxEngine`) is currently inactive. A `docker-compose.yml` is provided for containerized environments, with automated fallback to Neon / local Postgres URL |
| **Prisma** | Dev dependency | Database ORM, migration engine, schema generation, and Prisma Studio | CLI initialized via `npx prisma` |

---

## 2. Editor Extensions & Capabilities

Installed editor extensions detected via CLI:

| Extension ID | Purpose & Value in Rebuild | How to Use |
| :--- | :--- | :--- |
| **Prisma (`Prisma.prisma`)** | Prisma schema syntax highlighting, formatting, relation linting, and autocomplete | Formats `prisma/schema.prisma` automatically on save. Run `npx prisma studio` to open graphical browser database inspector on port 5555. |
| **Docker (`ms-azuretools.vscode-docker`)** | Container inspection, Dockerfile and `docker-compose.yml` management | Start Postgres container via Docker pane or `docker compose up -d`. |
| **GitLens & GitLens Inspect** | Line-by-line git blame, revision history, branch diff visualization | Review historical commits before refactoring legacy components to understand intentional logic. |
| **Python & Jupyter Tools** | Available in environment for standalone data processing / ETL scripts | Can run Python ETL scripts for OpenStreetMap and GTFS processing if needed. |

---

## 3. Database Operations (Prisma & Studio)

### Starting Local Database:
If Docker daemon is running:
```bash
docker compose up -d
```
If using cloud Neon Postgres:
Set `DATABASE_URL` and `DIRECT_URL` in `.env.local`.

### Prisma Commands:
- Generate Client: `npx prisma generate`
- Run Migrations: `npx prisma migrate dev --name <migration_name>`
- Seed Database: `npx tsx prisma/seed.ts`
- Launch Prisma Studio: `npx prisma studio` (Opens UI at `http://localhost:5555`)
