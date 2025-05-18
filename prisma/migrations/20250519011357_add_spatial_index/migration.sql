-- Creating spatial R-tree index on Place table for location field
CREATE SPATIAL INDEX idx_place_location ON Place(location);
