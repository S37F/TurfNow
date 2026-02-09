import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/Authcontext';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export const AdminProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useUserAuth();

  if (loading) {
    return (
      <Center h="100vh" bg="#F1F5F9">
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" thickness="4px" />
          <Text color="gray.500">Verifying access...</Text>
        </VStack>
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/turf" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
