import React from 'react';
import { Box, Badge, Heading, Text, Button, Image, HStack, VStack, Flex, Icon } from '@chakra-ui/react';
import { AiFillStar } from 'react-icons/ai';
import { MdLocationOn } from 'react-icons/md';
import { FiClock, FiUsers } from 'react-icons/fi';

export const TurfCard = ({ turf, onBookClick }) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.05)"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      border="1px solid"
      borderColor="gray.200"
      _hover={{ 
        transform: 'translateY(-6px)', 
        boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
        borderColor: 'red.500'
      }}
    >
      {/* Image Section */}
      <Box position="relative" height="200px" overflow="hidden">
        <Image
          src={turf.image}
          alt={turf.name}
          objectFit="cover"
          width="100%"
          height="100%"
          transition="transform 0.4s ease"
          _groupHover={{ transform: 'scale(1.08)' }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))"
        />
        {turf.available && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            bg="green.500"
            color="white"
            fontSize="xs"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            textTransform="uppercase"
          >
            Available
          </Badge>
        )}
        {turf.popular && (
          <Badge
            position="absolute"
            top={3}
            left={3}
            bg="orange.500"
            color="white"
            fontSize="xs"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            textTransform="uppercase"
          >
            Popular
          </Badge>
        )}
      </Box>

      {/* Content Section */}
      <VStack align="stretch" p={5} spacing={3}>
        <Heading 
          size="md" 
          noOfLines={1}
          fontFamily="'Poppins', sans-serif"
          color="gray.800"
        >
          {turf.name}
        </Heading>

        <HStack spacing={2} color="gray.600">
          <Icon as={MdLocationOn} color="red.500" />
          <Text fontSize="sm" noOfLines={1}>
            {turf.address || 'Location not specified'}
          </Text>
        </HStack>

        <HStack spacing={4}>
          {turf.rating > 0 && (
            <HStack spacing={1}>
              <Icon as={AiFillStar} color="orange.400" />
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                {turf.rating}
              </Text>
              {turf.totalReviews && (
                <Text fontSize="xs" color="gray.500">
                  ({turf.totalReviews})
                </Text>
              )}
            </HStack>
          )}
          {turf.capacity && (
            <HStack spacing={1}>
              <Icon as={FiUsers} color="gray.400" />
              <Text fontSize="sm" color="gray.600">
                {turf.capacity} players
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Facilities */}
        {turf.facilities && turf.facilities.length > 0 && (
          <HStack spacing={2} flexWrap="wrap">
            {turf.facilities.slice(0, 3).map((facility, index) => (
              <Badge 
                key={index} 
                bg="gray.100" 
                color="gray.600"
                fontSize="xs"
                fontWeight="600"
                px={2}
                py={1}
                borderRadius="md"
              >
                {facility}
              </Badge>
            ))}
            {turf.facilities.length > 3 && (
              <Badge 
                bg="red.50" 
                color="red.500"
                fontSize="xs"
                fontWeight="600"
                px={2}
                py={1}
                borderRadius="md"
              >
                +{turf.facilities.length - 3} more
              </Badge>
            )}
          </HStack>
        )}

        {/* Footer - Price & Book */}
        <Flex 
          justify="space-between" 
          align="center" 
          pt={4}
          mt={1}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              Starting from
            </Text>
            <HStack spacing={1} align="baseline">
              <Text 
                fontSize="2xl" 
                fontWeight="800" 
                color="red.500"
                lineHeight={1}
              >
                ₹{turf.pricePerHour}
              </Text>
              <Text fontSize="sm" color="gray.500">/hr</Text>
            </HStack>
          </VStack>

          <Button 
            bg="linear-gradient(135deg, #DC2626, #B91C1C)"
            color="white"
            size="md"
            fontWeight="700"
            borderRadius="lg"
            px={6}
            _hover={{ 
              transform: 'scale(1.05)',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
            }}
            _active={{ transform: 'scale(0.98)' }}
            onClick={() => onBookClick(turf)}
          >
            Book Now
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};
