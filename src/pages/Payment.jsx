import React, { useEffect, useState } from 'react'
import "../style/payment.css"
import { IoMdArrowRoundBack } from "react-icons/io"
import { Link, useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/Authcontext'
import { bookingAPI } from '../services/api'
import { 
  Button, 
  Text, 
  useToast, 
  VStack, 
  Box, 
  Badge, 
  HStack, 
  Flex, 
  Icon,
  Divider,
  Spinner,
  Center
} from '@chakra-ui/react'
import { PopoverProfile } from '../components/Popover'
import Logo from '../components/Logo'
import { MdLocationOn, MdAccessTime, MdCalendarToday, MdAccountBalanceWallet } from "react-icons/md"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react'

export const Payment = () => {
  const { user, logout } = useUserAuth();
  const [latestBooking, setLatestBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [processing, setProcessing] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err.message);
    }
  };

  // Fetch latest booking from API
  useEffect(() => {
    const fetchLatestBooking = async () => {
      if (!user) return;
      try {
        setBookingLoading(true);
        const response = await bookingAPI.getMyBookings();
        const bookings = response.data?.data || [];
        if (bookings.length > 0) {
          // Sort by createdAt descending and get the latest
          bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestBooking(bookings[0]);
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          status: "error",
          duration: 3000,
        });
      } finally {
        setBookingLoading(false);
      }
    };
    fetchLatestBooking();
  }, [user]);

  const { isOpen, onOpen, onClose } = useDisclosure()

  const name = latestBooking?.turfName || '';
  const address = latestBooking?.turfAddress || '';
  const time = latestBooking?.time || '';
  const bookingDate = latestBooking?.bookingDate || '';
  const amount = latestBooking?.turfPrice || 0;

  const handlePayment = async () => {
    try {
      setProcessing(true)
      toast({
        title: 'Booking Confirmed',
        description: 'Please pay cash at the venue',
        status: 'success',
        duration: 3000,
      })
      onOpen()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Box minH="100vh" bg="#F1F5F9">
      {/* Navigation */}
      <Box 
        bg="linear-gradient(135deg, #0F172A, #1E293B)"
        borderBottom="3px solid #DC2626"
      >
        <Flex 
          maxW="1400px" 
          mx="auto" 
          px={{ base: 4, md: 6 }}
          py={4}
          justify="space-between"
          align="center"
        >
          <HStack spacing={{ base: 2, md: 4 }}>
            <Link to="/turf">
              <Box 
                p={2} 
                borderRadius="lg" 
                bg="whiteAlpha.100"
                _hover={{ bg: 'whiteAlpha.200' }}
                cursor="pointer"
              >
                <IoMdArrowRoundBack color="white" size={20} />
              </Box>
            </Link>
            <Box display={{ base: 'none', sm: 'block' }}>
              <Logo variant="full" size="sm" color="white" />
            </Box>
            <Box display={{ base: 'block', sm: 'none' }}>
              <Logo variant="icon" size="sm" color="white" />
            </Box>
          </HStack>
          
          <HStack spacing={{ base: 2, md: 4 }}>
            <Text 
              color="white" 
              fontSize={{ base: 'md', md: 'xl' }} 
              fontWeight="bold"
              fontFamily="'Poppins', sans-serif"
              display={{ base: 'none', md: 'block' }}
            >
              Complete Payment
            </Text>
            <PopoverProfile handleLogout={handleLogout} email={user?.email} />
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        {bookingLoading ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="red.500" thickness="4px" />
              <Text color="gray.500">Loading booking details...</Text>
            </VStack>
          </Center>
        ) : !latestBooking ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Text fontSize="4xl">📅</Text>
              <Text fontWeight="bold" color="gray.700">No booking found</Text>
              <Link to="/turf">
                <Button colorScheme="red">Browse Turfs</Button>
              </Link>
            </VStack>
          </Center>
        ) : (
        <Box maxW="500px" mx="auto">
          {/* Booking Summary Card */}
          <Box 
            bg="white" 
            borderRadius={{ base: 'lg', md: 'xl' }} 
            overflow="hidden"
            boxShadow="0 10px 40px rgba(0,0,0,0.1)"
            border="1px solid"
            borderColor="gray.200"
            mb={{ base: 4, md: 6 }}
          >
            <Box 
              bg="linear-gradient(135deg, #0F172A, #1E293B)" 
              px={{ base: 4, md: 6 }} 
              py={{ base: 3, md: 4 }}
            >
              <Text 
                color="white" 
                fontSize={{ base: 'md', md: 'lg' }} 
                fontWeight="bold"
                fontFamily="'Poppins', sans-serif"
              >
                Booking Summary
              </Text>
            </Box>

            <VStack align="stretch" p={{ base: 4, md: 6 }} spacing={{ base: 3, md: 4 }}>
              <Box>
                <Text 
                  fontSize={{ base: 'lg', md: 'xl' }} 
                  fontWeight="800" 
                  color="gray.800"
                  fontFamily="'Poppins', sans-serif"
                >
                  {name}
                </Text>
                {address && (
                  <HStack color="gray.500" mt={1}>
                    <Icon as={MdLocationOn} color="red.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>{address}</Text>
                  </HStack>
                )}
              </Box>

              <Divider />

              <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                <HStack justify="space-between">
                  <HStack color="gray.600">
                    <Icon as={MdCalendarToday} color="red.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontWeight="500" fontSize={{ base: 'sm', md: 'md' }}>Date</Text>
                  </HStack>
                  <Text fontWeight="bold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>{bookingDate}</Text>
                </HStack>

                <HStack justify="space-between">
                  <HStack color="gray.600">
                    <Icon as={MdAccessTime} color="red.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontWeight="500" fontSize={{ base: 'sm', md: 'md' }}>Time Slot</Text>
                  </HStack>
                  <Text fontWeight="bold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>{time}</Text>
                </HStack>
              </VStack>

              <Box bg="red.50" p={{ base: 3, md: 4 }} borderRadius="lg" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="600" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Total Amount</Text>
                  <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="red.500">
                    ₹{amount}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* Payment Information Card */}
          <Box 
            bg="white" 
            borderRadius={{ base: 'lg', md: 'xl' }} 
            boxShadow="0 10px 40px rgba(0,0,0,0.1)"
            border="1px solid"
            borderColor="gray.200"
            p={{ base: 4, md: 6 }}
          >
            <Text 
              fontSize={{ base: 'md', md: 'lg' }} 
              fontWeight="bold" 
              color="gray.800"
              fontFamily="'Poppins', sans-serif"
              mb={{ base: 3, md: 4 }}
            >
              Payment Information
            </Text>

            <Box 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              border="2px solid"
              borderColor="green.200"
              bg="green.50"
              mb={{ base: 4, md: 6 }}
            >
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={MdAccountBalanceWallet} color="green.500" boxSize={{ base: 5, md: 6 }} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>Pay at Venue</Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                    Pay cash when you arrive at the turf
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Button
              w="100%"
              size={{ base: 'md', md: 'lg' }}
              bg="linear-gradient(135deg, #DC2626, #B91C1C)"
              color="white"
              fontWeight="bold"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              _active={{ transform: 'translateY(0)' }}
              onClick={handlePayment}
              isLoading={processing}
              loadingText="Processing..."
              fontSize={{ base: 'sm', md: 'md' }}
            >
              Confirm Booking
            </Button>
          </Box>
        </Box>
        )}
      </Box>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'sm', md: 'md' }}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={{ base: 3, md: 4 }} borderRadius="xl">
          <ModalHeader textAlign="center" pt={{ base: 6, md: 8 }}>
            <Text fontSize={{ base: '3xl', md: '4xl' }}>🎉</Text>
            <Text 
              fontSize={{ base: 'lg', md: 'xl' }} 
              fontWeight="bold" 
              color="gray.800"
              fontFamily="'Poppins', sans-serif"
            >
              Booking Confirmed!
            </Text>
          </ModalHeader>
          <ModalBody pb={4}>
            <VStack spacing={{ base: 2, md: 3 }} bg="gray.50" p={{ base: 3, md: 4 }} borderRadius="lg">
              <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>{name}</Text>
              <HStack w="100%" justify="space-between">
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Date</Text>
                <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>{bookingDate}</Text>
              </HStack>
              <HStack w="100%" justify="space-between">
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Time</Text>
                <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>{time}</Text>
              </HStack>
              <HStack w="100%" justify="space-between">
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Amount</Text>
                <Text fontWeight="bold" color="red.500" fontSize={{ base: 'sm', md: 'md' }}>₹{amount}</Text>
              </HStack>
              <Badge colorScheme="orange" p={2} borderRadius="md" fontSize="xs">
                Pay cash at the venue
              </Badge>
            </VStack>
          </ModalBody>
          <ModalFooter pt={0} pb={{ base: 4, md: 6 }} gap={{ base: 2, md: 3 }} flexDirection={{ base: 'column', sm: 'row' }}>
            <Link to="/booking" style={{ flex: 1, width: '100%' }}>
              <Button w="100%" colorScheme="red" size={{ base: 'md', md: 'lg' }}>
                View Booking
              </Button>
            </Link>
            <Link to="/turf" style={{ flex: 1, width: '100%' }}>
              <Button w="100%" variant="outline" onClick={onClose} size={{ base: 'md', md: 'lg' }}>
                Browse Turfs
              </Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
