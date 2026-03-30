---
name: frontend-integrate-api
description: 'Integrate a backend API endpoint into the webapp frontend. Use when adding a new API call, creating query/mutation hooks, setting up an API class, or wiring up a new entity to the data-access layer. Covers GET queries, POST/PUT/PATCH/DELETE mutations, AxiosConfig setup, environment variables, DTOs, query keys, and React Query cache updates.'
argument-hint: 'Describe the endpoint(s) to integrate, or supply NestJS controller file + line numbers'
---

# Integrate API Endpoint

## When to Use

- Adding a new API call to the webapp frontend
- Creating React Query hooks (useQuery / useMutation) for a new or existing entity
- Setting up a new API class for an entity that does not yet have one
- Wiring up environment variables for a new service URL

## Reminders

- Do not blindly follow the existing code templates. Check if the referenced Types, Interfaces, DTOs, and constants actually exist.
- Check if the file paths are correct.
- If some are missing or incorrect, adjust accordingly and notify the user at the end to remind them to the update the `SKILL.md` file so that it's always updated.

---

## Step 0 — Gather Requirements

Before writing any code, confirm you have all of the following. If any are missing and cannot be inferred, **explicitly ask the user** before proceeding. Do not assume.

| Requirement        | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| **API entity**     | The domain entity being operated on (e.g. `Story`, `StaffCapacity`) |
| **Endpoint path**  | The HTTP path (e.g. `/story/:id`)                                   |
| **HTTP method**    | `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`                          |
| **URL params**     | Route params (e.g. `:id`) or query params (e.g. `?storyId=`)        |
| **Request shape**  | Body or params DTO                                                  |
| **Response shape** | The returned data structure                                         |

### Option A — NestJS Controller Reference

If the user provides a NestJS controller file and line numbers:

1. Read only the specified handler method from the controller to extract the HTTP method, path, params, and body DTO.
2. Locate and read the corresponding CQRS handler file (e.g. `get.{entity}.by.id.handler.ts`) to confirm the response DTO.
3. Use the DTOs as the source of truth for request and response shapes. Look them up in the `@dto` package.

### Option B — Description Only

If the user describes the endpoint in plain text, infer as many details as possible. If critical details (method, path, request/response shape) are still ambiguous after inference, ask the user before continuing.

---

## Step 1 — Check for Existing API Class

Look for an existing API class file at:

```
libs/frontend/data-access/src/api/{entityName}.ts
```

Use camelCase for the filename (e.g. `staffCapacity.ts`).

### If the API class does NOT exist — create it

1. **Determine the API URL environment variable name** following the pattern `API_{ENTITY_UPPERCASE}_URL` (e.g. `API_STAFF_CAPACITY_URL`). Ask the user if unsure.

2. **Add the environment variable** to three places (see Step 2).

3. **Create the API class file** extending `AxiosConfig`. Use the template below.

**API class template:**

```typescript
import { /* relevant DTOs */ } from '@dto';
import ENV from '../config';
import { Response } from '../types/response';
import { AxiosConfig } from './axiosConfig';

const {ENTITY_UPPERCASE}_URL = '/{entity-path}';

class {Entity}Api extends AxiosConfig {
    constructor() {
        super(ENV.API_{ENTITY_UPPERCASE}_URL as string, true, true);
    }

    public get{Entity}ById = async (id: string): Promise<Response<{Entity}Dto>> => {
        return await this.axiosInstance.get(`${{ENTITY_UPPERCASE}_URL}/by-{entity}-id/${id}`);
    };
}

export default new {Entity}Api();
```

4. **Check if `AxiosConfig` exists** at `libs/frontend/data-access/src/api/axiosConfig.ts`. If it does not exist, create it using the following template:

```typescript
import { STORAGE_KEY } from '@utils/config/constants';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { isUndefined } from 'lodash';
import { ResponseError } from '../types/responseError';

export class AxiosConfig {
    protected axiosInstance: AxiosInstance;

    constructor(baseURL: string, withAuthorization: boolean, shouldRedirectUnauthorized: boolean) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 150000,
            timeoutErrorMessage: 'Time out!',
            headers: {
                'Content-Type': 'application/json',
            },
            paramsSerializer: {
                indexes: null,
            },
        });
        this.addInterceptor(this.axiosInstance, withAuthorization, shouldRedirectUnauthorized);
    }

    protected addInterceptor(
        instance: AxiosInstance,
        withAuthorization: boolean,
        shouldRedirectUnauthorized: boolean,
    ): void {
        if (withAuthorization) {
            instance.interceptors.request.use(
                async (config) => {
                    const token = await this.getIdTokenAsync();
                    config.headers.Authorization = `Bearer ${token}`;
                    config.headers['sessionId'] = Cookies.get(STORAGE_KEY.SESSION_ID) || '';
                    return config;
                },
                async (error) => {
                    return await Promise.reject(error);
                },
            );
        }

        instance.interceptors.response.use(
            function (response) {
                if ([200, 201].includes(response.status)) {
                    if (isUndefined(response.data.body)) {
                        return { data: response.data, statusCode: response.data.statusCode };
                    }
                    if (
                        Array.isArray(response.data.body) ||
                        typeof response.data.body === 'string' ||
                        response.data.body === null
                    ) {
                        return { body: response.data.body, statusCode: response.data.statusCode };
                    }
                    return { ...response.data.body, statusCode: response.data.statusCode };
                } else {
                    const error: ResponseError = { ...new Error(response.statusText), response };
                    throw error;
                }
            },
            function (error) {
                if (shouldRedirectUnauthorized && error?.response?.status === 401) {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(error);
            },
        );
    }

    protected async getIdTokenAsync(): Promise<string> {
        return sessionStorage.getItem(STORAGE_KEY.ID_TOKEN) || Cookies.get(STORAGE_KEY.ID_TOKEN) || '';
    }
}
```

### If the API class already exists

Add the new method(s) to the existing class following the same patterns and naming conventions already present in the file.

---

## Step 2 — Add Environment Variable (new API class only)

If a new API URL environment variable was introduced in Step 1, add it to **all three** of the following locations:

### 2a. `libs/frontend/data-access/src/config/index.ts`

Add to the `ENV` object:

```typescript
API_{ENTITY_UPPERCASE}_URL: process.env.API_{ENTITY_UPPERCASE}_URL,
```

### 2b. `apps/web-app/next.config.js`

Add inside the `env` block of `nextConfig`:

```javascript
API_{ENTITY_UPPERCASE}_URL: process.env.API_{ENTITY_UPPERCASE}_URL,
```

### 2c. `web-app.env.dev`

Add the variable:

```
API_{ENTITY_UPPERCASE}_URL=http://localhost:{PORT}
```

Ask the user for the correct localhost port if unknown.

---

## Step 3 — Add Query Key (if new entity)

Open `libs/frontend/data-access/src/config/index.ts` and check if `QUERY_KEY` already has a key for this entity.

If it does not, add one following the existing casing pattern (SCREAMING_SNAKE_CASE key, lowercase kebab-case value):

```typescript
{ENTITY_UPPERCASE}: '{entity-lowercase}',
```

---

## Step 4 — Implement GET Queries

For each `GET` endpoint, add a React Query hook to:

```
libs/frontend/data-access/src/query/{entityName}.ts
```

Create this file if it does not exist.

**Pattern for a single-entity query (by ID):**

```typescript
export const useQuery{Entity}ById = (id?: string) => {
    const { data, isFetching, isLoading } = useQuery({
        queryKey: [QUERY_KEY.{ENTITY_UPPERCASE}, id],
        queryFn: () => {Entity}Api.get{Entity}ById(id as string),
        enabled: !!id,
    });

    return { {entityCamelCase}: data, isFetching, isLoading };
};
```

**Pattern for a list/paginated query:**

```typescript
export const useQuery{Entity}Records = (filters: {FilterDto}) => {
    const { data, isFetching } = useQuery({
        queryKey: [QUERY_KEY.{ENTITY_UPPERCASE}, 'list', filters],
        queryFn: () => {Entity}Api.get{Entity}Records(filters),
    });

    return { data, isFetching };
};
```

---

## Step 5 — Implement Mutations

For each non-GET endpoint (`POST`, `PUT`, `PATCH`, `DELETE`), add a React Query mutation hook to:

```
libs/frontend/data-access/src/mutations/{entityName}.ts
```

Create this file if it does not exist.

**Cache update rule — always prefer `setQueryData` over `invalidateQueries`:**
In the `onSuccess` callback, update the relevant query cache directly using `queryClient.setQueryData` with the same `queryKey` used in the corresponding `useQuery` hook. Only use `invalidateQueries` for list queries where the full list must be re-fetched (e.g. after a create or delete).

**Pattern for a create mutation:**

```typescript
export const useCreate{Entity} = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: create{Entity}, isPending } = useMutation({
        mutationFn: async (data: Create{Entity}Dto) => {Entity}Api.create{Entity}(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.{ENTITY_UPPERCASE}, 'list'],
            });

            if (!isUndefined(response.{entityCamelCase}Id)) {
                queryClient.setQueryData<Response<{Entity}Dto>>(
                    [QUERY_KEY.{ENTITY_UPPERCASE}, response.{entityCamelCase}Id],
                    response
                );
            }
        },
    });

    return { isPending, create{Entity} };
};
```

**Pattern for an update mutation:**

```typescript
export const useUpdate{Entity} = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: update{Entity}, isPending } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Update{Entity}Dto }) =>
            {Entity}Api.update{Entity}(id, data),
        onSuccess: (response) => {
            if (!isUndefined(response.{entityCamelCase}Id)) {
                queryClient.setQueryData<Response<{Entity}Dto>>(
                    [QUERY_KEY.{ENTITY_UPPERCASE}, response.{entityCamelCase}Id],
                    response
                );
            }
        },
    });

    return { isPending, update{Entity} };
};
```

**Pattern for a delete mutation:**

```typescript
export const useDelete{Entity} = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: delete{Entity}, isPending } = useMutation({
        mutationFn: async (id: string) => {Entity}Api.delete{Entity}(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.{ENTITY_UPPERCASE}, 'list'],
            });
        },
    });

    return { isPending, delete{Entity} };
};
```

---

## Step 6 — Multiple Endpoints

If the user requests multiple endpoints at once, apply Steps 1–5 for each endpoint in sequence. Group query hooks into the query file and mutation hooks into the mutations file for the same entity.

---

## Naming & Casing Rules

| Item                             | Convention                                | Example                                   |
| -------------------------------- | ----------------------------------------- | ----------------------------------------- |
| API class name                   | PascalCase + `Api`                        | `StaffCapacityApi`                        |
| API filename                     | camelCase `.ts`                           | `staffCapacity.ts`                        |
| Query hook                       | `useQuery{Entity}{Descriptor}`            | `useQueryStoryById`                       |
| Mutation hook                    | `use{Verb}{Entity}`                       | `useCreateStory`                          |
| Env var key in ENV / next.config | `API_{ENTITY}_URL` (SCREAMING_SNAKE_CASE) | `API_STAFF_CAPACITY_URL`                  |
| QUERY_KEY key                    | SCREAMING_SNAKE_CASE                      | `STAFF_CAPACITY`                          |
| QUERY_KEY value                  | lowercase kebab                           | `'staff-capacity'`                        |
| DTO imports                      | from `@dto`                               | `import { StaffCapacityDto } from '@dto'` |
| Response type                    | `Response<T>` or `ResponseArray<T>`       | `Response<StaffCapacityDto>`              |

---

## Checklist

Before finishing, verify:

- [ ] API method added to the API class
- [ ] New env var added to `ENV`, `next.config.js`, and `web-app.env.dev` (only if new class)
- [ ] `QUERY_KEY` entry exists for the entity
- [ ] GET endpoints have a `useQuery` hook in `query/{entityName}.ts`
- [ ] Non-GET endpoints have a `useMutation` hook in `mutations/{entityName}.ts`
- [ ] `onSuccess` uses `setQueryData` to update the cache for single-entity results
- [ ] `onSuccess` uses `invalidateQueries` only for list queries after create/delete
- [ ] DTOs are imported from `@dto`
- [ ] Naming conventions match the table above
