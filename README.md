# Presight Frontend Exercise

## How to run this project

### Run in Docker

#### Start project

```code
docker compose up -d
```

#### run migrations and seeds

##### Single run

```code
docker compose exec server yarn workspace server db:migrate:seed
```

##### Separate seed and migration execution

```code
docker compose exec server yarn workspace server db:migrate
```

#### run seeds

```code
docker compose exec server yarn workspace server db:seed
```

#### Server host

```code
http://localhost:3000/
```

#### Client host

```code
http://localhost:5173/
```

#### delete volumes and shutdown container

```code
docker compose down -v
```

#### Destroy images as well

```code
docker compose down -v --rmi local
```

## Candidate Notes

The project will be organized using feature branches, each representing a specific part of the development process. Once completed, branches will be merged into main and retained to preserve a full history of development stages and enable easy review of progress.

### feature/setup

The purpose of this feature is to establish the initial project setup, including the core tooling, folder structure, and development environment configuration. This ensures a consistent foundation for future development and makes it easier to scale and maintain the project over time.

#### commitlint + husky

This setup enforces consistent commit messages and pre-commit checks. It helps maintain a clean Git history by validating commit formats and preventing invalid commits from being pushed.

More details: [commitlint docs](https://commitlint.js.org/)

#### Typescript

TypeScript is used as the primary language for the project to introduce static typing on top of JavaScript. This improves code quality, reduces runtime errors, and makes the codebase easier to refactor and scale.

Considering the project is structured as a monorepo, the root tsconfig.json should avoid enforcing compilerOptions, since these decisions are better handled at the individual workspace level. Each workspace may have different runtime targets, bundlers, or framework requirements, and enforcing a global configuration would reduce flexibility and increase friction when scaling or introducing new packages.

At the initial stage, the root tsconfig.json should only act as a project reference layer, pointing to the individual workspace configurations. This keeps the setup minimal and avoids premature abstraction.

As the application grows in complexity, introducing a tsconfig.base.json becomes a reasonable next step.

More details: [typescript docs](https://www.typescriptlang.org/docs/)

#### Eslint + Prettier + Lint-staged

ESLint is used for static analysis and enforcing consistent code quality rules across the codebase. A shared eslint.base.cjs configuration defines the core rules and is inherited by each workspace, allowing per-package overrides while keeping a consistent baseline.

More details: [eslint docs](https://eslint.org/)

Prettier handles automatic code formatting to ensure a uniform style across all files, independent of developer or editor preferences.

More details: [prettier docs](https://prettier.io/)

lint-staged runs ESLint and Prettier only on staged files before commits, ensuring only changed code is validated and formatted. It is typically paired with Husky to enforce these checks via Git hooks.

More details: [lint-staged docs](https://github.com/lint-staged/lint-staged)

Together, these tools enforce consistent quality and formatting with minimal overhead.

### feature/setup-server

#### Testing

This setup introduces a robust testing environment for the server using Vitest, Supertest, and automated coverage reporting. It ensures that API endpoints, business logic, and integrations are thoroughly validated before code is merged.

- **Vitest:** Used as the primary test runner due to its blazing-fast performance, native TypeScript support, and compatibility with the Vite ecosystem. It provides an efficient watch mode and seamless execution of unit and integration tests.
- **Supertest:** Integrated to handle HTTP assertions. It allows us to spin up the server in isolation and simulate HTTP requests (e.g., `GET`, `POST`) to test API routes and responses without needing to manually start the full application network layer.
- **Coverage Reporting:**

More details: [Vitest docs](https://vitest.dev/) | [Supertest docs](https://github.com/ladjs/supertest)

#### Docker & Docker Compose

Used to standardize the server runtime and eliminate environment inconsistencies across development, testing, and production. Docker Compose orchestrates multi-service setups enabling reproducible local development environments.

#### Sqlite

One of the project requirements is to use a sqlite database. When choosing a sqlite database there are a couple of options available:

| Feature              | better-sqlite3                                                                                                                                          | node:sqlite (Built-in)                                                                                                                         | sqlite3 (Legacy)                                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **API Style**        | Synchronous (blocking, simple control flow)                                                                                                             | Synchronous (modern built-in API)                                                                                                              | Asynchronous (callbacks / Promises)                                                                                  |
| **Performance**      | 🏆 Fastest (native C++ bindings, minimal overhead)                                                                                                      | ⚡ Fast (native, slightly higher overhead than direct bindings)                                                                                | 🐢 Slowest (thread pool + async abstraction overhead)                                                                |
| **Installation**     | `npm install better-sqlite3` (native build)                                                                                                             | No install (built into Node 22+)                                                                                                               | `npm install sqlite3` (native build required)                                                                        |
| **Setup Friction**   | Low (straightforward import + usage)                                                                                                                    | Medium (requires Node version + `--experimental-sqlite` in some setups)                                                                        | Low (standard npm package)                                                                                           |
| **Stability**        | ✅ Mature and production-proven                                                                                                                         | ⚠️ Stable-ish but still evolving (newer API surface)                                                                                           | ✅ Mature, widely used legacy standard                                                                               |
| **Code Readability** | ⭐⭐⭐⭐⭐ (no async/await, minimal boilerplate)                                                                                                        | ⭐⭐⭐⭐⭐ (clean synchronous-style API)                                                                                                       | ⭐⭐⭐ (async patterns add verbosity)                                                                                |
| **Portability**      | High (works across environments via npm)                                                                                                                | Medium (Node version dependent, feature gated)                                                                                                 | High (works across Node versions)                                                                                    |
| **Best For**         | High-performance local DB access, backend services, CLI tools, data-heavy logic, and situations where sync execution improves simplicity and throughput | Minimal-dependency applications, modern Node 22+ projects, lightweight embedded DB usage, and environments where built-in tooling is preferred | Legacy systems, async-first architectures, large existing codebases, and compatibility with older Node.js ecosystems |

For the sake of simplicity better-sqlite3 provides the flexibility that fits this exercise.

While ORMs provide features such as schema management, migrations, and query abstractions, they also introduce trade-offs including additional complexity, framework-specific conventions, and an abstraction layer over SQL. For the scope of this exercise, I chose not to assume those trade-offs were justified and instead opted for a simple SQL-first approach.

As a result, a lightweight migration runner was implemented to manage schema evolution. Migrations are defined as SQL files, discovered automatically at startup, executed in order, and tracked through a dedicated migrations table.

Each migration runs inside a transaction, ensuring that both the schema changes and migration record are committed together, preventing partial migration states.

This approach keeps the database layer simple, transparent, and fully under application control while providing reliable schema versioning.

### feature/setup-client

#### Vite + React + Typescript

The client is intentionally kept minimal to fit the current monorepo structure and avoid introducing duplicate or conflicting TypeScript configuration. It starts as a lightweight React setup, with complexity added incrementally as needed, rather than relying on create-vite-app, which includes unnecessary defaults and overlaps with existing root-level tooling such as TypeScript and ESLint.

This approach keeps the monorepo root as the single source of truth for shared configuration and ensures the client remains aligned with project-specific requirements instead of generic scaffolding.

#### Tailwind

Tailwind is chosen for this project to keep styling minimal, consistent, and low-overhead. It avoids the need for custom CSS architecture or additional styling abstractions, which would add unnecessary complexity for the current scope.

More details: [tailwind docs](https://tailwindcss.com/)

## Excercise Notes

Build a small full-stack user directory application. The goal is to evaluate how you design a searchable, filterable, paginated UI backed by persisted data and clear API boundaries.

The application should include:

- A React client.
- A Node.js API server.
- A SQLite database used as the source of truth for user data.
- Docker configuration for running the application locally.

### Scenario

Users need to browse a large directory of people, search by name, and narrow results by nationality and hobbies. The filter sidebar should help users discover useful filters based on the result set they are currently viewing.

### Requirements

#### Data Model

Seed a SQLite database with enough records to make pagination, infinite scroll, search, and filter counts meaningful.

Each user should have:

- `avatar`
- `first_name`
- `last_name`
- `age`
- `nationality`
- `hobbies`, from 0 to 10 hobbies per user

Choose a data model that supports the required behavior.

SQLite must be the persisted source of user data.

#### API

Expose an API that supports:

- Paginated user results.
- Text filtering from user input across `first_name` and `last_name`.
- Filtering by one or more nationalities.
- Filtering by one or more hobbies.
- Sorting by `first_name`, `last_name`, `age`, and `nationality`.
- Pagination metadata so the client can determine whether more results are available.
- Top 20 hobbies for the active text filter and filter state, including `{ value, count }`.
- Top 20 nationalities for the active text filter and filter state, including `{ value, count }`.

The top 20 values and counts must reflect the currently applied text filter and selected filters, not the global dataset.

Filter semantics:

- Multiple selected hobbies should match users who have all selected hobbies.
- Multiple selected nationalities should match users from any selected nationality.
- Text, hobby, and nationality filters should apply together.

Sorting semantics:

- Sorted results must be deterministic. Use `id` as a final tie-breaker when values are equal.
- Pagination must respect the active sort without duplicate or missing users.

#### Client

Build a React interface that includes:

- A text filter input for `first_name` and `last_name`.
- A virtualized, infinitely scrolling list of user cards.
- A sidebar containing the top 20 hobbies and top 20 nationalities for the current result set, including counts.
- Controls for applying and removing hobby and nationality filters.
- Controls for choosing sort field and sort direction.
- Loading, empty, and error states.
- A responsive layout that remains usable on desktop and mobile.

User cards should follow this structure:

```text
|----------------------------------|
| avatar      first_name+last_name |
|             nationality      age |
|                                  |
|             (2 hobbies) (+n)     |
|----------------------------------|
```

Show up to 2 hobbies on the card. If the user has more hobbies, display the remaining count as `+n`.

Use a virtual scroll implementation for the list.

When the text filter or selected filters change, the client must refresh both:

- The paginated user list.
- The top 20 hobbies and nationalities in the sidebar.

The text filter value, selected hobbies, selected nationalities, sort field, and sort direction must be reflected in the URL query string. Reloading or sharing the URL should restore the same view state.

### Implementation Notes

- Keep the database setup easy to run locally.
- Include seed logic or a documented command that creates the SQLite database.
- Include a `Dockerfile` and `docker-compose.yml` that can run the application locally.

### Evaluation Focus

We will pay particular attention to:

- Correct data persistence and API behavior.
- Correct filtering, sorting, pagination, and top 20 counts.
- Smooth infinite scrolling with virtualization.
- URL-synced state.
- Clear loading, empty, and error states.
- Easy local and Docker-based setup.

### Deliverables

Please provide:

- Source code for the React client and Node.js server.
- A `Dockerfile` and `docker-compose.yml`.
- Instructions for setup, database seeding, and running locally.
- Instructions for running with Docker Compose.
