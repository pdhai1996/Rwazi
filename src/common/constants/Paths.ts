
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
  Services: {
    Base: '/services',
    GetAll: '',
  },
  Favorites: {
    Base: '/favorites',
    Add: '',
    Get: '',
    Remove: '/:favoriteId',
    Check: '/check/:placeId',
  },
  Docs: {
    Base: '/docs',
    Json: '/json',
  },
} as const;
