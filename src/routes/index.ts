import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
// import { UserController } from '@src/controllers/UserController';
import { authRouter } from './AuthRoutes';
import { placeRouter } from './PlaceRoutes';
import { favoriteRouter } from './FavoriteRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
// userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
// userRouter.put(Paths.Users.Update, UserRoutes.update);
// userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

apiRouter.use("/auth", authRouter);

// Add PlaceRouter
apiRouter.use(Paths.Places.Base, placeRouter);

// Import FavoriteRouter

// Add FavoriteRouter
apiRouter.use(Paths.Favorites.Base, favoriteRouter);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
