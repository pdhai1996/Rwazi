import prisma from '../../prisma/client';

export class BaseRepo<T extends object, K extends string | number = number> {
  protected model: any;
  
  constructor(modelName: string) {
    // Access the model dynamically using the model name
    this.model = prisma[modelName as keyof typeof prisma];
    
    if (!this.model) {
      throw new Error(`Model ${modelName} not found in Prisma client`);
    }
  }

  async findAll(options: { where?: any; select?: any; include?: any } = {}): Promise<T[]> {
    return this.model.findMany(options);
  }

  async findById(id: K, options: { select?: any; include?: any } = {}): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      ...options
    });
  }

  async findOne(where: any, options: { select?: any; include?: any } = {}): Promise<T | null> {
    return this.model.findFirst({
      where,
      ...options
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data
    });
  }

  async update(id: K, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data
    });
  }

  async delete(id: K): Promise<T> {
    return this.model.delete({
      where: { id }
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }
}