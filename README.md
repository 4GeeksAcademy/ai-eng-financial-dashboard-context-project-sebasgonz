# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
agents/
├─ rules/
│  ├─ <rule-name>.md
│  └─ proposed-contributor-rules.md (Phase 2 historical analysis)
└─ skills/ (optional)
   └─ <skill-name>/SKILL.md
```

Approved rules and the historical Phase 2 analysis are consolidated under [agents/rules](agents/rules), indexed by [AGENTS.md](AGENTS.md). If created, the optional skills directory belongs under `agents/skills`.

## How to run locally

```bash
docker compose up --build
```

With Docker Compose, the frontend uses the Vite proxy for `/api` and needs no extra environment variables.
When running Vite outside Compose or targeting another API origin, set `VITE_API_BASE_URL` in `frontend/.env.local`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

In Codespaces, use forwarded-port URLs; the localhost links above apply to a local run publishing those ports. This Compose setup is for development: Vite dev, Uvicorn with reload, and debugpy on `5678`, which must not be publicly exposed.

| Variable | Consumer | Current use |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser, through Vite | Optional API origin; empty uses same-origin `/api/metrics`. |
| `API_PROXY_TARGET` | Vite server | Compose sets `http://host.docker.internal:8000` and the gateway alias; without the variable, Vite uses `http://backend:8000`. |

If the backend published port changes, also review the proxy target. Internal Docker names are not public browser addresses.

## Dashboard Data Contract

The dashboard requests `GET /api/metrics` and computes KPIs and monthly series on the client; those charts do not consume `/api/metrics/summary`. Each movement includes `create_date` (ISO date), `amount`, `operation_type`, `category`, and `business_type`, keeping JSON names in snake_case.

For example, `GET /api/metrics?operation_type=income` returns only income records. Allowed values are defined in both [routes.py](backend/app/routes.py) and [financial-types.ts](frontend/src/lib/financial-types.ts); contract changes must review both definitions and their consumers.

## Data and Calculations

The API generates 360 sample movements with clock-dependent dates; a fixed seed does not fix the year. With income of `1000` and outcome of `250`, profit is `750` and profit as a percentage of income is `75%`. Without income, the percentage is `0`. Whole-dollar USD formatting is presentation only.

Known limitation: monthly grouping converts ISO dates to `Date` and reads the local month; `2024-02-01` can be grouped as January west of UTC. This has been reproduced, not fixed in this documentation-only phase.

## Isolated Validation

From the repository root, with Docker and images containing the dependencies available:

```bash
docker compose run --rm --no-deps frontend npm test
docker compose run --rm --no-deps backend pytest -q
```

These commands do not require running services or start their dependencies. They check frontend utilities and backend routes, not the browser or proxy. Containers use repository volumes and may generate caches. Add pytest `-k` to select a backend task; also validate the build when types or components change.

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
