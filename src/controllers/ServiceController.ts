import { IReq, IRes } from '@src/routes/common/types';
import { serviceService } from '@src/services/ServiceService';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service categories API endpoints
 */
class ServiceController {
  /**
   * @swagger
   * /api/services:
   *   get:
   *     summary: Get all service categories
   *     description: Retrieve a list of all available service categories
   *     tags: [Services]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of service categories
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 services:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   *                       slug:
   *                         type: string
   *       401:
   *         description: Unauthorized, authentication required
   *       500:
   *         description: Internal server error
   */
  async getAllServices(req: IReq, res: IRes) {
    try {
      const services = await serviceService.getAllServices();
      res.status(HttpStatusCodes.OK).json({ data: services });
    } catch (error) {
      console.error('Error retrieving services:', error);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: 'Failed to retrieve services' 
      });
    }
  }
}

const serviceController = new ServiceController();

export { serviceController };
