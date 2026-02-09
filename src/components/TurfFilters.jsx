import React from 'react';
import {
  Box,
  Input,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Flex,
  Button,
  InputGroup,
  InputLeftElement,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiDollarSign, FiList, FiX } from 'react-icons/fi';

export const TurfFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = filters.search || filters.city || filters.sortBy || 
    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000));

  return (
    <Box 
      bg="white" 
      p={5} 
      borderRadius="xl" 
      boxShadow="sm" 
      border="1px solid"
      borderColor="gray.200"
      mb={6}
    >
      <Grid 
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
        gap={4}
        alignItems="end"
      >
        {/* Search */}
        <GridItem>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
            Search
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#DC2626" />
            </InputLeftElement>
            <Input
              placeholder="Search turfs..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              borderRadius="lg"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
            />
          </InputGroup>
        </GridItem>

        {/* City */}
        <GridItem>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
            Location
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiMapPin color="#DC2626" />
            </InputLeftElement>
            <Select
              value={filters.city || ''}
              onChange={(e) => onFilterChange('city', e.target.value)}
              pl={10}
              borderRadius="lg"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
            >
              <option value="">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
            </Select>
          </InputGroup>
        </GridItem>

        {/* Sort */}
        <GridItem>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
            Sort By
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiList color="#DC2626" />
            </InputLeftElement>
            <Select
              value={filters.sortBy || ''}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              pl={10}
              borderRadius="lg"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
            >
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </Select>
          </InputGroup>
        </GridItem>

        {/* Price Range */}
        <GridItem>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
            Price: ₹{filters.priceRange?.[0] || 0} - ₹{filters.priceRange?.[1] || 3000}
          </Text>
          <Box px={2} pt={2}>
            <RangeSlider
              defaultValue={[0, 3000]}
              min={0}
              max={3000}
              step={100}
              value={filters.priceRange || [0, 3000]}
              onChange={(val) => onFilterChange('priceRange', val)}
            >
              <RangeSliderTrack bg="gray.200" h="8px" borderRadius="full">
                <RangeSliderFilledTrack bg="red.500" />
              </RangeSliderTrack>
              <RangeSliderThumb 
                index={0} 
                boxSize={5} 
                bg="red.500"
                _focus={{ boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.3)' }}
              />
              <RangeSliderThumb 
                index={1} 
                boxSize={5} 
                bg="red.500"
                _focus={{ boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.3)' }}
              />
            </RangeSlider>
          </Box>
        </GridItem>
      </Grid>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Flex justify="flex-end" mt={4}>
          <Button 
            size="sm" 
            colorScheme="red" 
            variant="ghost" 
            leftIcon={<FiX />}
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </Flex>
      )}
    </Box>
  );
};
