import React from 'react';
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('Error caught by boundary:', error, errorInfo);
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
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
            p={8} 
            borderRadius="xl"
            boxShadow="xl"
            maxW="500px"
          >
            <Icon as={MdErrorOutline} boxSize={16} color="red.500" />
            
            <Heading size="lg" color="gray.800">
              Oops! Something went wrong
            </Heading>
            
            <Text color="gray.600">
              We're sorry for the inconvenience. Please try refreshing the page or go back to the homepage.
            </Text>
            
            {!import.meta.env.PROD && this.state.error && (
              <Box 
                bg="red.50" 
                p={4} 
                borderRadius="md" 
                w="100%" 
                textAlign="left"
                maxH="200px"
                overflow="auto"
              >
                <Text fontSize="sm" fontFamily="mono" color="red.700">
                  {this.state.error.toString()}
                </Text>
              </Box>
            )}
            
            <VStack spacing={3} w="100%">
              <Button
                leftIcon={<MdRefresh />}
                colorScheme="red"
                onClick={this.handleReload}
                w="100%"
                borderRadius="full"
              >
                Refresh Page
              </Button>
              
              <Button
                leftIcon={<MdHome />}
                variant="outline"
                colorScheme="gray"
                onClick={this.handleGoHome}
                w="100%"
                borderRadius="full"
              >
                Go to Homepage
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
