---
name: backend-add-dto
description: Generate the three DTO files for a new app domain under libs/dto/. Use this when adding a new service domain and you need to scaffold create.{app-name}.dto.ts, {app-name}.dto.ts, and {app-name}.enum.ts. ALWAYS asks the user for the full field layout before creating any file — do not proceed without it.
---

# Add DTO

Canonical reference: `libs/dto/src/lib/task-estimator/`

All DTO files live under:

```
libs/dto/src/lib/{app-name}/
```

---

## Mandatory Pre-Condition — Layout Required

**Before writing a single file, you MUST collect the field layout from the user.**

Ask the user this exact question (or a clear equivalent):

> Please provide the field layout for the `{app-name}` DTO.
> For each field, specify:
> - **Field name**
> - **Data type** (`string`, `number`, `boolean`, `Date`, or an enum name)
> - **Required or optional**
> - **Enum values** (if the type is an enum)
> - **Which fields to omit from `Create{AppName}` DTO** (the ID and any server-managed fields)

**Do NOT create any files if the user does not supply this layout.** If the user asks you to proceed without a layout, respond:

> I need the field layout before I can generate the DTO. Please provide the fields, their types, and which ones should be omitted from the Create DTO.

---

## Files to Generate

| File | Purpose |
|---|---|
| `{app-name}.enum.ts` | All enums used by this domain |
| `{app-name}.dto.ts` | Full data shape with all fields and class-validator + Swagger decorators |
| `create.{app-name}.dto.ts` | Input DTO — extends the main DTO via `OmitType`, omitting server-managed fields |

---

## File Naming Rules

- All lowercase, hyphen-separated (`task-estimator`, `user-profile`)
- Enum file: `{app-name}.enum.ts`
- Main DTO: `{app-name}.dto.ts`
- Create DTO: `create.{app-name}.dto.ts`

---

## Type-to-Decorator Mapping

Use these class-validator + Swagger decorators for each field type:

| Data type | Decorators to apply |
|---|---|
| `string` | `@IsString()` |
| `string` (not empty) | `@IsString()` `@IsNotEmpty()` |
| `number` | `@IsNumber()` |
| `boolean` | `@IsBoolean()` |
| `Date` | `@IsDateString()` |
| enum | `@IsEnum(EnumName)` |
| optional field | add `@IsOptional()` and type as `Type \| undefined` with `?` suffix |

Every field also gets `@ApiProperty()` from `@nestjs/swagger`.

---

## enum.ts Template

```typescript
export enum {EnumName} {
    VALUE_ONE = 'VALUE_ONE',
    VALUE_TWO = 'VALUE_TWO',
}
```

Rules:
- One `export enum` block per distinct enum used by this domain
- Enum member names and values are `SCREAMING_SNAKE_CASE`
- All values are string literals matching their key

---

## {app-name}.dto.ts Template

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { {EnumName} } from './{app-name}.enum';

export class {AppName}Dto {
    @ApiProperty()
    @IsString()
    {appName}Id!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    {requiredStringField}!: string;

    @ApiProperty()
    @IsNumber()
    {numberField}!: number;

    @ApiProperty()
    @IsEnum({EnumName})
    {enumField}!: {EnumName};

    @ApiProperty()
    @IsString()
    @IsOptional()
    {optionalField}?: string;
}
```

Rules:
- Class name is `{AppName}Dto` where `AppName` is PascalCase
- The ID field is always the first property, named `{appName}Id` (camelCase)
- Required fields use `!` (definite assignment)
- Optional fields use `?` and include `@IsOptional()`
- Import only the decorators actually used — do not import unused ones
- Import enums from the local `./{app-name}.enum` file

---

## create.{app-name}.dto.ts Template

```typescript
import { OmitType } from '@nestjs/swagger';
import { {AppName}Dto } from './{app-name}.dto';

export class Create{AppName} extends OmitType({AppName}Dto, [
    '{appName}Id',
    '{serverManagedField}',
] as const) {}
```

Rules:
- Always extends `OmitType` from `@nestjs/swagger` — never copy-paste fields
- Omit the ID field and any server-managed fields the user specifies (e.g. `status`, `createdAt`)
- The class name is `Create{AppName}` (no `Dto` suffix)
- The `as const` assertion on the tuple is mandatory

---

## index.ts Export Update

After creating the files, update `libs/dto/src/index.ts` to export the new Create DTO:

```typescript
// {AppName}
export * from './lib/{app-name}/create.{app-name}.dto';
```

Add a blank-line-separated comment block per domain. Do not remove existing exports.

---

## Complete Example — "user-profile" domain

**Field layout provided by user:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `userProfileId` | `string` | yes | ID — omit from Create |
| `displayName` | `string` | yes | |
| `bio` | `string` | no | optional |
| `age` | `number` | yes | |
| `role` | enum `UserRole` | yes | values: `ADMIN`, `MEMBER`, `GUEST` — omit from Create |
| `createdAt` | `Date` | yes | server-managed — omit from Create |

**`user-profile.enum.ts`:**
```typescript
export enum UserRole {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    GUEST = 'GUEST',
}
```

**`user-profile.dto.ts`:**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from './user-profile.enum';

export class UserProfileDto {
    @ApiProperty()
    @IsString()
    userProfileId!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    displayName!: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty()
    @IsNumber()
    age!: number;

    @ApiProperty()
    @IsEnum(UserRole)
    role!: UserRole;

    @ApiProperty()
    @IsDateString()
    createdAt!: Date;
}
```

**`create.user-profile.dto.ts`:**
```typescript
import { OmitType } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

export class CreateUserProfile extends OmitType(UserProfileDto, [
    'userProfileId',
    'role',
    'createdAt',
] as const) {}
```

**`libs/dto/src/index.ts` addition:**
```typescript
// User Profile
export * from './lib/user-profile/create.user-profile.dto';
```

---

## Step-by-Step Execution

1. **Ask for the layout** — Do not skip. See "Mandatory Pre-Condition" above.
2. **Confirm the layout with the user** — Repeat it back as a table and ask for approval before creating files.
3. **Create `{app-name}.enum.ts`** — Only if the layout contains at least one enum field.
4. **Create `{app-name}.dto.ts`** — Apply correct decorators for every field.
5. **Create `create.{app-name}.dto.ts`** — Use `OmitType` with the fields the user marked as omitted.
6. **Update `libs/dto/src/index.ts`** — Add the export line for the new Create DTO.
7. **Verify** — Run `nx build dto` and confirm there are no compile errors.
