
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
    Add: '',
    Get: '',
    Remove: '/:favoriteId',
    Check: '/check/:placeId',
  },
} as const;
