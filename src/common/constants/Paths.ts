// filepath: /var/www/LocationSearch/src/common/constants/Paths.ts
export default {
  Base: '/api',
  Users: {
    Base: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Places: {
    Base: '/places',
    Search: '/search',
  },
  Favorites: {
    Base: '/favorites',
    Add: '', // Changed from '/add' to '' for POST /api/favorites
    Get: '', // Changed from '/all' to '' for GET /api/favorites
    Remove: '/:favoriteId',
    Check: '/check/:placeId',
  },
} as const;
