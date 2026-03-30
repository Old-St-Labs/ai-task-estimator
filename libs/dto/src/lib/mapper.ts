import { ClassConstructor, plainToInstance } from "class-transformer";

export class Mapper {

  //make sure that target class has @Expose decorator on all properties
  static map<T, V>(cls: ClassConstructor<T>, plain: V): T {
    return plainToInstance(cls, plain, {});
  }

  static merge<T>(base: T, partial: Partial<T>): T {
    return {
      ...base,
      ...Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined)),
    };
  }
}
