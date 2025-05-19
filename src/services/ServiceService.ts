import prisma from '../common/prisma';

interface ServiceResult {
    id: number;
    name: string;
    slug: string;
}

class ServiceService {
  /**
   * Get all available service categories
   * @returns Array of all service categories
   */
  async getAllServices(): Promise<ServiceResult[]> {
    try {
      const services = await prisma.service.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      return services as ServiceResult[];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}

const serviceService = new ServiceService();

export { serviceService };
