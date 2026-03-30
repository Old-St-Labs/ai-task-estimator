import { readFile, writeFile } from 'fs/promises';

type JsonDb = Record<string, unknown[]>;

export class JsonModel<Entity> {

    private filePath = 'db.json';
    private key: string;

    constructor(entity: new () => Entity) {
        this.key = entity.name.toLowerCase();
    }

    private async readDb(): Promise<JsonDb> {
        try {
            const raw = await readFile(this.filePath, 'utf-8');
            const content = raw.trim();
            return content ? JSON.parse(content) : {};
        } catch {
            return {};
        }
    }

    private async writeDb(db: JsonDb): Promise<void> {
        await writeFile(this.filePath, JSON.stringify(db, null, 2), 'utf-8');
    }

    async create(entity: Entity): Promise<Entity> {
        const db = await this.readDb();
        const collection = (db[this.key] ?? []) as Entity[];
        collection.push(entity);
        db[this.key] = collection;
        await this.writeDb(db);
        return entity;
    }

    async update(entity: Partial<Entity>, key: string, value: unknown): Promise<Entity> {
        const db = await this.readDb();
        const collection = (db[this.key] ?? []) as Entity[];
        const index = collection.findIndex(e => e[key as keyof Entity] === value);
        if (index === -1) {
            throw new Error(`Entity with ${key}=${value} not found`);
        }
        const updated = { ...collection[index], ...entity };
        collection[index] = updated;
        db[this.key] = collection;
        await this.writeDb(db);
        return updated;
    }

    async get(key: string, value: unknown): Promise<Entity | null> {
        const db = await this.readDb();
        const collection = (db[this.key] ?? []) as Entity[];
        return collection.find(e => e[key as keyof Entity] === value) || null;
    }

    async getAll(): Promise<Entity[]> {
        const db = await this.readDb();
        const collection = (db[this.key] ?? []) as Entity[];
        return collection;
    }

    async delete(key: string, value: unknown): Promise<void> {
        const db = await this.readDb();
        const collection = (db[this.key] ?? []) as Entity[];
        const filtered = collection.filter(e => e[key as keyof Entity] !== value);
        db[this.key] = filtered;
        await this.writeDb(db);
    }
}
