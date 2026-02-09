import React from 'react'
import { Navigate } from "react-router-dom"
import { useUserAuth } from '../context/Authcontext';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUserAuth();

    if (loading) {
        return (
            <Center h="100vh" bg="#F1F5F9">
                <VStack spacing={4}>
                    <Spinner size="xl" color="red.500" thickness="4px" />
                    <Text color="gray.500">Loading...</Text>
                </VStack>
            </Center>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
