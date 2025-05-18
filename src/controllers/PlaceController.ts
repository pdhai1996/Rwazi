import { IReq, IRes } from "@src/routes/common/types";
import { placeService } from "@src/services/PlaceService";

class PlaceController {
    async searchPlaces(req: IReq, res: IRes): Promise<void> {
        try {   
            const { lat, lng } = req.query;
            const location = { lat: Number(lat), lng: Number(lng) };
            const radius = Number(req.query.radius)  * 1000;
            const serviceId = req.query.serviceId ? Number(req.query.serviceId) : undefined;
            const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
            const page = req.query.page ? Number(req.query.page) : undefined;
            const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
            
            // Include user information from authentication middleware
            const userId = req.user?.id;
            
            // Log search request with user ID if available
            console.log(`Search places request from user ${userId || 'unknown'}: location(${lat},${lng}), radius: ${radius}m`);
            
            const results = await placeService.searchPlaces(
                location, 
                radius, 
                serviceId, 
                keyword, 
                page, 
                pageSize,
                userId
            );
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

const placeController = new PlaceController();

export { placeController };