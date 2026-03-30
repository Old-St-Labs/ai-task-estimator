---
name: create-db-service
description: Create a database service for entities in the system.
---

# Create Database Service
This skill helps you create the boilerplate code for a database service that can be used to perform CRUD operations on a specific entity in the system. The service will be designed to work with a simple JSON file as the database, allowing for easy data persistence without the need for a complex database setup.

## When to use this skill

Use this skill when you need to:
- Create a new database service for an entity that does not yet have one.

## Creating a Database Service

- First create a directory for the service based on the entity name (e.g., `user-database-service` for a `User` entity).

### Naming contract (required)

Derive a base entity name from the DTO/entity and use that base name everywhere.

- If input is `UserDto`, base name is `User` (strip `Dto` suffix).
- Folder name: `<base-name-kebab>-database-service`
- Abstract service class: `<BaseName>DatabaseService`
- Concrete service class: `<BaseName>DatabaseServiceImpl`
- Provider constant: `<BaseName>DatabaseServiceProvider`
- Module class: `<BaseName>DatabaseServiceModule`

Never use generic names like `DatabaseServiceModule` without the entity/base prefix.

For `UserDto`, required names are:
- `user-database-service`
- `UserDatabaseService`
- `UserDatabaseServiceImpl`
- `UserDatabaseServiceProvider`
- `UserDatabaseServiceModule`

- It should have the abstract class (user-database.service.ts) and the concrete implementation (user-database.service.impl.ts) of the service.

When creating the service, an abstract class should be created, function inside the class will be defined by the input provided by the user. [create, update, delete, get, getAll]

After an abstract class is created, a concrete implementation of the service should be created, which will implement the functions defined in the abstract class. The concrete implementation will handle the actual logic for performing CRUD operations on the JSON file.

export abstract class UserDatabaseService {
  abstract create(data: UserEntity): Promise<UserDto>;
  abstract update(data: Partial<UserEntity>, key: string, value: unknown): Promise<UserDto>;
  abstract delete(key: string, value: unknown): Promise<void>;
  abstract get(key: string, value: unknown): Promise<UserDto>;
  abstract getAll(): Promise<UserDto[]>;
}

export class UserDatabaseServiceImpl
  extends AbstractDatabaseService<UserDto, UserEntity> 
  implements UserDatabaseService {

    constructor() {
      super(new JsonModel<UserEntity>(UserEntity), UserDto);
    }
}

- Finally, create a factory function (user-database.service.factory.ts) that will be responsible for creating instances of the concrete implementation of the service.

export const UserDatabaseServiceProvider = {
    provide: UserDatabaseService,
    useClass: UserDatabaseServiceImpl
};

## Exporting the service
Create a module file (*-database-service.module.ts) name should be related to the db service entity that will export the service and its provider, allowing it to be easily imported and used in other parts of the application.

@Module({
    providers: [
        UserDatabaseServiceProvider
    ],
    exports: [
        UserDatabaseServiceProvider
    ],
})
export class UserDatabaseServiceModule {}

add the module and the service file but not the impl file to the index.ts file in the database-service library, so that it can be easily imported and used in other parts of the application.

## Output checklist (must pass before finishing)

- Module class uses entity-specific name (`<BaseName>DatabaseServiceModule`).
- No generic class name (`DatabaseServiceModule`) appears in generated output.
- `index.ts` exports module and abstract service only (not impl).
