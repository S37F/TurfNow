import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Text,
  VStack,
  Box
} from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";

export const PopoverProfile = (prop) => {
  
  const { name, email, handleLogout, image } = prop;
  const { isAdmin, isOwner } = useUserAuth();

  const navigate = useNavigate();

  const truncateEmail = (email) => {
    if (!email) return "";
    if (email.length > 20) {
      return email.substring(0, 17) + "...";
    }
    return email;
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button 
          colorScheme={"red"} 
          size={{ base: 'sm', md: 'md' }}
          p={{ base: 2, md: 3 }}
        >
          {<AiOutlineUser fontSize={"20px"} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        w={{ base: '250px', md: '280px' }}
        borderRadius="lg"
        boxShadow="xl"
        mx={2}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader 
          fontWeight={"bold"} 
          color="gray.700"
          fontSize={{ base: 'xs', md: 'sm' }}
          py={3}
        >
          <Text noOfLines={1}>Welcome</Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="normal" color="gray.500" noOfLines={1}>
            {truncateEmail(email)}
          </Text>
        </PopoverHeader>
        <PopoverBody py={3}>
          <VStack spacing={2}>
            <Button
              colorScheme={"red"}
              width="100%"
              size={{ base: 'sm', md: 'md' }}
              onClick={() => navigate("/booking")}
            >
              My Bookings
            </Button>
            {isOwner && (
              <Button
                colorScheme={"teal"}
                width="100%"
                size={{ base: 'sm', md: 'md' }}
                onClick={() => navigate("/owner/dashboard")}
              >
                Owner Dashboard
              </Button>
            )}
            {isAdmin && (
              <Button
                colorScheme={"purple"}
                width="100%"
                size={{ base: 'sm', md: 'md' }}
                onClick={() => navigate("/admin")}
              >
                Admin Panel
              </Button>
            )}
            <Button 
              colorScheme={"gray"} 
              width="100%"
              size={{ base: 'sm', md: 'md' }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
