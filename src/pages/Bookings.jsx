import React, { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import { bookingAPI } from "../services/api";
import { 
  Button, 
  Text, 
  Box, 
  VStack, 
  HStack, 
  Image, 
  Badge,
  Icon,
  Flex,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  SimpleGrid
} from "@chakra-ui/react";
import { BookingSkeleton } from "../components/BookingSkeleton";
import { PopoverProfile } from "../components/Popover";
import Logo from "../components/Logo";
import { MdLocationOn, MdAccessTime, MdCalendarToday, MdDelete } from "react-icons/md";
import "../style/payment.css";

export const Bookings = () => {
  const { user, logout } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookings();
      const data = response.data?.data || [];
      // Sort by createdAt descending (newest first)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelClick = (bookingId) => {
    setCancellingId(bookingId);
    onOpen();
  };

  const handleCancelConfirm = async () => {
    if (!cancellingId) return;
    try {
      await bookingAPI.cancelBooking(cancellingId);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
        status: "success",
        duration: 3000,
      });
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to cancel booking",
        status: "error",
        duration: 3000,
      });
    } finally {
      setCancellingId(null);
      onClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const EmptyState = () => (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="50vh"
      p={{ base: 4, md: 8 }}
    >
      <Box fontSize={{ base: '4xl', md: '6xl' }} mb={4}>📅</Box>
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="gray.700" mb={2} textAlign="center">
        No bookings yet
      </Text>
      <Text color="gray.500" mb={6} textAlign="center" fontSize={{ base: 'sm', md: 'md' }} px={4}>
        You don't have any active bookings yet.<br/>
        Book a turf to get started!
      </Text>
      <Link to="/turf">
        <Button 
          bg="linear-gradient(135deg, #DC2626, #B91C1C)"
          color="white"
          size={{ base: 'md', md: 'lg' }}
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
        >
          Browse Turfs
        </Button>
      </Link>
    </Flex>
  );

  const BookingCard = ({ booking }) => (
    <Box 
      bg="white" 
      borderRadius={{ base: 'lg', md: 'xl' }} 
      overflow="hidden"
      boxShadow="0 10px 40px rgba(0,0,0,0.1)"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Image */}
      {booking.turfImage && (
        <Box position="relative" h={{ base: '140px', md: '180px' }}>
          <Image 
            src={booking.turfImage} 
            alt={booking.turfName} 
            w="100%" 
            h="100%" 
            objectFit="cover"
          />
          <Badge 
            position="absolute" 
            top={{ base: 3, md: 4 }} 
            right={{ base: 3, md: 4 }}
            colorScheme={getStatusColor(booking.status)}
            px={{ base: 2, md: 3 }}
            py={1}
            borderRadius="full"
            fontWeight="bold"
            fontSize={{ base: 'xs', md: 'sm' }}
            textTransform="capitalize"
          >
            {booking.status || 'confirmed'}
          </Badge>
        </Box>
      )}

      {/* Content */}
      <VStack align="stretch" p={{ base: 4, md: 6 }} spacing={{ base: 3, md: 4 }}>
        <Box>
          <Text 
            fontSize={{ base: 'lg', md: 'xl' }} 
            fontWeight="800" 
            color="gray.800"
            fontFamily="'Poppins', sans-serif"
          >
            {booking.turfName}
          </Text>
          {booking.turfAddress && (
            <HStack color="gray.500" mt={1}>
              <Icon as={MdLocationOn} color="red.500" boxSize={{ base: 4, md: 5 }} />
              <Text fontSize={{ base: 'xs', md: 'sm' }}>{booking.turfAddress}</Text>
            </HStack>
          )}
        </Box>

        <Divider />

        <Box bg="gray.50" p={{ base: 3, md: 4 }} borderRadius="lg">
          <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
            <HStack justify="space-between">
              <HStack color="gray.600">
                <Icon as={MdCalendarToday} color="red.500" boxSize={{ base: 4, md: 5 }} />
                <Text fontWeight="500" fontSize={{ base: 'sm', md: 'md' }}>Date</Text>
              </HStack>
              <Text fontWeight="bold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                {booking.bookingDate}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <HStack color="gray.600">
                <Icon as={MdAccessTime} color="red.500" boxSize={{ base: 4, md: 5 }} />
                <Text fontWeight="500" fontSize={{ base: 'sm', md: 'md' }}>Time Slot</Text>
              </HStack>
              <Text fontWeight="bold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                {booking.time}
              </Text>
            </HStack>

            {booking.turfPrice > 0 && (
              <>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="600" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Amount</Text>
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="800" color="red.500">
                    ₹{booking.turfPrice}
                  </Text>
                </HStack>
              </>
            )}
          </VStack>
        </Box>

        {/* Actions - only show cancel for non-cancelled bookings */}
        {booking.status !== 'cancelled' && (
          <Button
            variant="outline"
            colorScheme="red"
            leftIcon={<MdDelete />}
            onClick={() => handleCancelClick(booking.id)}
            _hover={{ bg: 'red.50' }}
            size={{ base: 'sm', md: 'md' }}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            Cancel Booking
          </Button>
        )}
      </VStack>
    </Box>
  );

  // Filter active bookings (non-cancelled)
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

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
              My Bookings ({activeBookings.length})
            </Text>
            <PopoverProfile handleLogout={handleLogout} email={user?.email} />
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        {loading ? (
          <Box maxW="600px" mx="auto">
            <BookingSkeleton />
          </Box>
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <Box maxW="1200px" mx="auto">
            {activeBookings.length > 0 && (
              <>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" mb={4} color="gray.700">
                  Active Bookings
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </SimpleGrid>
              </>
            )}

            {cancelledBookings.length > 0 && (
              <>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" mb={4} color="gray.400">
                  Cancelled
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} opacity={0.6}>
                  {cancelledBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </SimpleGrid>
              </>
            )}

            <Flex justify="center" mt={8}>
              <Link to="/turf">
                <Button
                  bg="linear-gradient(135deg, #DC2626, #B91C1C)"
                  color="white"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  size={{ base: 'md', md: 'lg' }}
                >
                  Book Another Turf
                </Button>
              </Link>
            </Flex>
          </Box>
        )}
      </Box>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Booking
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Keep Booking
              </Button>
              <Button colorScheme="red" onClick={handleCancelConfirm} ml={3}>
                Yes, Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
