import React from 'react';
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { MdHome, MdSportsSoccer } from 'react-icons/md';

export const NotFound = () => {
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="#F1F5F9"
      px={4}
    >
      <VStack 
        spacing={6} 
        textAlign="center" 
        bg="white" 
        p={{ base: 6, md: 10 }} 
        borderRadius="xl"
        boxShadow="xl"
        maxW="500px"
        w="100%"
      >
        <Icon as={MdSportsSoccer} boxSize={20} color="red.500" />
        
        <Heading 
          size="2xl" 
          bgGradient="linear(135deg, #DC2626, #B91C1C)"
          bgClip="text"
          fontFamily="'Poppins', sans-serif"
        >
          404
        </Heading>
        
        <Heading size="lg" color="gray.800" fontFamily="'Poppins', sans-serif">
          Page Not Found
        </Heading>
        
        <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
          Looks like this page went out of bounds! The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <VStack spacing={3} w="100%">
          <Link to="/turf" style={{ width: '100%' }}>
            <Button
              w="100%"
              bg="linear-gradient(135deg, #DC2626, #B91C1C)"
              color="white"
              fontWeight="bold"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              _active={{ transform: 'translateY(0)' }}
              borderRadius="full"
              size="lg"
              leftIcon={<MdSportsSoccer />}
            >
              Browse Turfs
            </Button>
          </Link>
          
          <Link to="/" style={{ width: '100%' }}>
            <Button
              w="100%"
              variant="outline"
              colorScheme="gray"
              borderRadius="full"
              size="lg"
              leftIcon={<MdHome />}
            >
              Go to Homepage
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
};

export default NotFound;
