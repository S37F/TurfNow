import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Box, Flex, Text, HStack, VStack, Link as ChakraLink, Icon, Show, Hide } from "@chakra-ui/react";
import Logo from "./Logo";

export const Footer = () => {
  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  ];

  return (
    <Box 
      as="footer" 
      bg="linear-gradient(180deg, #0F172A, #0A0F1A)"
      color="white"
      py={{ base: 8, md: 12 }}
      px={{ base: 3, md: 8 }}
      borderTop="3px solid #DC2626"
    >
      <Box maxW="1400px" mx="auto">
        <VStack spacing={{ base: 5, md: 8 }}>
          {/* Logo */}
          <Hide below="sm">
            <Logo variant="full" size="lg" color="white" />
          </Hide>
          <Show below="sm">
            <Logo variant="full" size="md" color="white" />
          </Show>

          {/* Tagline */}
          <Text 
            fontSize={{ base: "sm", sm: "md", md: "lg", lg: "xl" }}
            fontWeight="600"
            textAlign="center"
            maxW="500px"
            lineHeight="1.6"
            px={2}
          >
            Find and book your nearest{" "}
            <Text 
              as="span" 
              bgGradient="linear(135deg, #DC2626, #F59E0B)"
              bgClip="text"
              fontWeight="800"
            >
              TURF
            </Text>
            {" "}just a click away!
          </Text>

          {/* Social Icons */}
          <HStack spacing={{ base: 3, md: 4 }}>
            {socialLinks.map(({ icon, href, label }) => (
              <ChakraLink
                key={label}
                href={href}
                aria-label={label}
                p={{ base: 2, md: 3 }}
                borderRadius="full"
                bg="whiteAlpha.100"
                _hover={{ 
                  bg: 'red.500',
                  transform: 'translateY(-3px)'
                }}
                transition="all 0.3s"
              >
                <Icon as={icon} boxSize={{ base: 4, md: 5 }} />
              </ChakraLink>
            ))}
          </HStack>

          {/* Bottom Bar */}
          <Box 
            w="100%"
            pt={{ base: 5, md: 8 }}
            mt={{ base: 2, md: 4 }}
            borderTop="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Flex 
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              gap={{ base: 3, md: 4 }}
            >
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="whiteAlpha.700" textAlign="center">
                © {new Date().getFullYear()} TurfNow. All rights reserved.
              </Text>
              <HStack 
                spacing={{ base: 4, md: 6 }} 
                fontSize={{ base: 'xs', md: 'sm' }} 
                color="whiteAlpha.700"
                flexWrap="wrap"
                justify="center"
              >
                <ChakraLink href="/privacy" _hover={{ color: 'red.400' }}>Privacy Policy</ChakraLink>
                <ChakraLink href="/terms" _hover={{ color: 'red.400' }}>Terms of Service</ChakraLink>
                <ChakraLink href="mailto:support@turfnow.com" _hover={{ color: 'red.400' }}>Contact Us</ChakraLink>
              </HStack>
            </Flex>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
