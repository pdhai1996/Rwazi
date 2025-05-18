import { IReq, IRes } from '@src/routes/common/types';
import { placeService } from '@src/services/PlaceService';

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Place search API endpoints
 */
class PlaceController {
  /**
   * @swagger
   * /api/places/search:
   *   get:
   *     summary: Search for places by location and other criteria
   *     description: Find places based on geographical coordinates, radius,
   *       and optional filters
   *     tags: [Places]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: lat
   *         required: true
   *         description: Latitude of the center point
   *         schema:
   *           type: number
   *           format: float
   *           minimum: -90
   *           maximum: 90
   *       - in: query
   *         name: lng
   *         required: true
   *         description: Longitude of the center point
   *         schema:
   *           type: number
   *           format: float
   *           minimum: -180
   *           maximum: 180
   *       - in: query
   *         name: radius
   *         required: true
   *         description: Search radius in kilometers
   *         schema:
   *           type: number
   *           format: float
   *           minimum: 0
   *       - in: query
   *         name: serviceId
   *         required: false
   *         description: ID of the service to filter by
   *         schema:
   *           type: integer
   *           minimum: 1
   *       - in: query
   *         name: keyword
   *         required: false
   *         description: Search keyword for places
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         required: false
   *         description: Page number for pagination
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *       - in: query
   *         name: pageSize
   *         required: false
   *         description: Number of items per page
   *         schema:
   *           type: integer
   *           default: 20
   *           minimum: 1
   *     responses:
   *       200:
   *         description: A list of places with distance from center point
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   *                       service_id:
   *                         type: integer
   *                       longitude:
   *                         type: number
   *                         format: float
   *                       latitude:
   *                         type: number
   *                         format: float
   *                       distance:
   *                         type: number
   *                         format: float
   *                         description: Distance in meters from search point
   *                       serviceName:
   *                         type: string
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     pageSize:
   *                       type: integer
   *                     totalRecords:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     hasNextPage:
   *                       type: boolean
   *                     hasPreviousPage:
   *                       type: boolean
   *       401:
   *         description: Unauthorized access, authentication required
   *       500:
   *         description: Server error
   */
  public async searchPlaces(req: IReq, res: IRes): Promise<void> {
    try {   
      const { lat, lng } = req.query;
      const location = { lat: Number(lat), lng: Number(lng) };
      const radius = Number(req.query.radius) * 1000;
      
      const serviceId = req.query.serviceId ? 
        Number(req.query.serviceId) : undefined;
      
      const keyword = req.query.keyword ? 
        String(req.query.keyword as string) : undefined;
      
      const page = req.query.page ? Number(req.query.page) : undefined;
      
      const pageSize = req.query.pageSize ? 
        Number(req.query.pageSize) : undefined;
      
      // Log search request with generic information only
      // const logMsg = `Search: (${lat},${lng}), radius: ${radius}m`;
      const results = await placeService.searchPlaces(
        location, 
        radius, 
        serviceId, 
        keyword, 
        page, 
        pageSize,
      );
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

const placeController = new PlaceController();

export { placeController };