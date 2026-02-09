import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Spinner,
  Center,
  Flex,
  HStack,
  VStack,
  Text,
  Icon,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Show,
  Hide,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { 
  MdSportsSoccer, MdCalendarToday, MdAttachMoney, 
  MdAdd, MdRefresh, MdPerson, MdLocationOn 
} from 'react-icons/md';
import { FiClock, FiCheck, FiX } from 'react-icons/fi';
import { ownerAPI, turfAPI } from '../services/api';
import { useUserAuth } from '../context/Authcontext';
import Logo from '../components/Logo';
import { PopoverProfile } from '../components/Popover';

export const OwnerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileRes = await ownerAPI.getProfile();
      setProfile(profileRes.data.data);

      if (profileRes.data.data.status === 'approved') {
        const [turfsRes, bookingsRes] = await Promise.all([
          ownerAPI.getMyTurfs(),
          ownerAPI.getMyBookings(),
        ]);
        setTurfs(turfsRes.data.data || []);
        setBookings(bookingsRes.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('not-registered');
      } else {
        setError(err.response?.data?.error || 'Failed to load data');
        toast({
          title: 'Error',
          description: 'Failed to load owner data',
          status: 'error',
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.turfPrice || 0), 0);
  
  const todayBookings = bookings.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.bookingDate).toDateString() === today;
  }).length;

  const StatCard = ({ icon, label, value, helpText, color }) => (
    <Box 
      bg="white" 
      p={{ base: 4, md: 6 }} 
      borderRadius="xl" 
      boxShadow="0 4px 20px rgba(0,0,0,0.08)"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    >
      <HStack spacing={4}>
        <Box p={3} borderRadius="lg" bg={`${color}.50`}>
          <Icon as={icon} boxSize={{ base: 5, md: 6 }} color={`${color}.500`} />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="500">
            {label}
          </Text>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="gray.800">
            {value}
          </Text>
          <Text fontSize="xs" color="gray.400">{helpText}</Text>
        </VStack>
      </HStack>
    </Box>
  );

  if (loading) {
    return (
      <Center h="100vh" bg="#F1F5F9">
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" thickness="4px" />
          <Text color="gray.500">Loading dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  // Not registered as owner
  if (error === 'not-registered') {
    return (
      <Center h="100vh" bg="#F1F5F9">
        <VStack spacing={6} p={8} bg="white" borderRadius="xl" boxShadow="xl" maxW="500px">
          <Icon as={MdSportsSoccer} boxSize={16} color="red.500" />
          <Heading size="lg" textAlign="center">Not Registered as Owner</Heading>
          <Text color="gray.600" textAlign="center">
            You haven't registered as a turf owner yet. Register now to start listing your turfs!
          </Text>
          <HStack spacing={4}>
            <Button as={Link} to="/owner-signup" colorScheme="red" size="lg">
              Register as Owner
            </Button>
            <Button as={Link} to="/turf" variant="outline" size="lg">
              Browse Turfs
            </Button>
          </HStack>
        </VStack>
      </Center>
    );
  }

  // Pending approval
  if (profile?.status === 'pending') {
    return (
      <Center h="100vh" bg="#F1F5F9">
        <VStack spacing={6} p={8} bg="white" borderRadius="xl" boxShadow="xl" maxW="500px">
          <Box p={4} bg="yellow.100" borderRadius="full">
            <Icon as={FiClock} boxSize={12} color="yellow.600" />
          </Box>
          <Heading size="lg" textAlign="center">Application Pending</Heading>
          <Text color="gray.600" textAlign="center">
            Your owner registration for <strong>{profile.businessName}</strong> is being reviewed.
            We'll notify you via email once it's approved.
          </Text>
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription fontSize="sm">
                Our team will verify your business details within 1-2 business days.
              </AlertDescription>
            </Box>
          </Alert>
          <Button as={Link} to="/turf" variant="outline">
            Browse Turfs While You Wait
          </Button>
        </VStack>
      </Center>
    );
  }

  // Rejected
  if (profile?.status === 'rejected') {
    return (
      <Center h="100vh" bg="#F1F5F9">
        <VStack spacing={6} p={8} bg="white" borderRadius="xl" boxShadow="xl" maxW="500px">
          <Box p={4} bg="red.100" borderRadius="full">
            <Icon as={FiX} boxSize={12} color="red.600" />
          </Box>
          <Heading size="lg" textAlign="center">Application Not Approved</Heading>
          <Text color="gray.600" textAlign="center">
            Unfortunately, your owner registration was not approved.
          </Text>
          {profile.rejectionReason && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Reason</AlertTitle>
                <AlertDescription fontSize="sm">{profile.rejectionReason}</AlertDescription>
              </Box>
            </Alert>
          )}
          <Text fontSize="sm" color="gray.500">
            If you believe this was a mistake, please contact support.
          </Text>
          <Button as={Link} to="/owner-signup" colorScheme="red">
            Apply Again
          </Button>
        </VStack>
      </Center>
    );
  }

  // Approved - Full Dashboard
  return (
    <Box minH="100vh" bg="#F1F5F9">
      {/* Navigation */}
      <Box bg="linear-gradient(135deg, #0F172A, #1E293B)" borderBottom="3px solid #DC2626">
        <Flex 
          maxW="1400px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }}
          justify="space-between" align="center"
        >
          <HStack spacing={{ base: 2, md: 4 }}>
            <Link to="/turf">
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100" _hover={{ bg: 'whiteAlpha.200' }} cursor="pointer">
                <IoMdArrowRoundBack color="white" size={20} />
              </Box>
            </Link>
            <Hide below="sm">
              <Logo variant="full" size="sm" color="white" />
            </Hide>
            <Show below="sm">
              <Logo variant="icon" size="sm" color="white" />
            </Show>
          </HStack>
          
          <HStack spacing={{ base: 2, md: 4 }}>
            <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize={{ base: 'xs', md: 'sm' }}>
              <Icon as={FiCheck} mr={1} /> Verified Owner
            </Badge>
            <PopoverProfile handleLogout={handleLogout} />
          </HStack>
        </Flex>
      </Box>

      <Container maxW="1400px" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size={{ base: 'lg', md: 'xl' }} color="#0F172A">
              Welcome, {profile?.fullName}!
            </Heading>
            <Text color="gray.500">{profile?.businessName}</Text>
          </Box>
          <HStack spacing={3}>
            <Button 
              leftIcon={<MdRefresh />} 
              onClick={loadData} 
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
            >
              Refresh
            </Button>
            <Button 
              as={Link}
              to="/admin/add-turf"
              leftIcon={<MdAdd />} 
              colorScheme="red"
              size={{ base: 'sm', md: 'md' }}
            >
              Add Turf
            </Button>
          </HStack>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 6 }} mb={8}>
          <StatCard 
            icon={MdSportsSoccer} 
            label="My Turfs" 
            value={turfs.length} 
            helpText="Active listings" 
            color="blue" 
          />
          <StatCard 
            icon={MdCalendarToday} 
            label="Today's Bookings" 
            value={todayBookings} 
            helpText="Scheduled today" 
            color="green" 
          />
          <StatCard 
            icon={MdCalendarToday} 
            label="Total Bookings" 
            value={bookings.length} 
            helpText="All time" 
            color="purple" 
          />
          <StatCard 
            icon={MdAttachMoney} 
            label="Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            helpText="Total earnings" 
            color="orange" 
          />
        </SimpleGrid>

        {/* Tabs */}
        <Box bg="white" borderRadius="xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)" overflow="hidden">
          <Tabs colorScheme="red" variant="enclosed">
            <TabList borderBottom="2px solid" borderColor="gray.100" px={4} pt={4}>
              <Tab fontWeight="600" _selected={{ color: 'red.500', borderColor: 'red.500' }}>
                My Turfs ({turfs.length})
              </Tab>
              <Tab fontWeight="600" _selected={{ color: 'red.500', borderColor: 'red.500' }}>
                Bookings ({bookings.length})
              </Tab>
              <Tab fontWeight="600" _selected={{ color: 'red.500', borderColor: 'red.500' }}>
                Profile
              </Tab>
            </TabList>

            <TabPanels>
              {/* My Turfs Tab */}
              <TabPanel p={{ base: 3, md: 6 }}>
                {turfs.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Icon as={MdSportsSoccer} boxSize={16} color="gray.300" />
                      <Text color="gray.500">No turfs added yet</Text>
                      <Button as={Link} to="/admin/add-turf" colorScheme="red" leftIcon={<MdAdd />}>
                        Add Your First Turf
                      </Button>
                    </VStack>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {turfs.map(turf => (
                      <Box 
                        key={turf.id} 
                        p={4} 
                        borderRadius="lg" 
                        border="1px solid" 
                        borderColor="gray.200"
                        _hover={{ borderColor: 'red.300', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" mb={2}>
                          <Badge colorScheme="blue" textTransform="capitalize">{turf.sport}</Badge>
                          <Badge colorScheme={turf.available ? 'green' : 'red'}>
                            {turf.available ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <Heading size="sm" mb={2}>{turf.name}</Heading>
                        <HStack fontSize="sm" color="gray.600" mb={2}>
                          <Icon as={MdLocationOn} />
                          <Text>{turf.city}</Text>
                        </HStack>
                        <Text fontWeight="bold" color="red.500">₹{turf.pricePerHour}/hr</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* Bookings Tab */}
              <TabPanel p={{ base: 3, md: 6 }}>
                {bookings.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Icon as={MdCalendarToday} boxSize={16} color="gray.300" />
                      <Text color="gray.500">No bookings yet</Text>
                    </VStack>
                  </Center>
                ) : (
                  <TableContainer>
                    <Table size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Turf</Th>
                          <Th>Customer</Th>
                          <Th>Date</Th>
                          <Th>Time</Th>
                          <Th>Amount</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {bookings.slice(0, 20).map((booking, idx) => (
                          <Tr key={idx}>
                            <Td fontWeight="500">{booking.turfName}</Td>
                            <Td>{booking.email}</Td>
                            <Td>{booking.bookingDate}</Td>
                            <Td>{booking.time}</Td>
                            <Td fontWeight="600">₹{booking.turfPrice || 0}</Td>
                            <Td>
                              <Badge colorScheme={
                                booking.status === 'confirmed' || booking.status === 'completed' ? 'green' : 
                                booking.status === 'pending' ? 'yellow' : 'red'
                              }>
                                {booking.status || 'pending'}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* Profile Tab */}
              <TabPanel p={{ base: 3, md: 6 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Business Name</Text>
                    <Text fontWeight="600" fontSize="lg">{profile?.businessName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Owner Name</Text>
                    <Text fontWeight="600" fontSize="lg">{profile?.fullName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Email</Text>
                    <Text fontWeight="600">{profile?.email}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Phone</Text>
                    <Text fontWeight="600">{profile?.phone}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Address</Text>
                    <Text fontWeight="600">{profile?.businessAddress}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>City</Text>
                    <Text fontWeight="600">{profile?.city}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Sports Offered</Text>
                    <HStack wrap="wrap" gap={2}>
                      {profile?.sportTypes?.map(sport => (
                        <Badge key={sport} colorScheme="red" textTransform="capitalize">{sport}</Badge>
                      ))}
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Member Since</Text>
                    <Text fontWeight="600">
                      {profile?.approvedAt ? new Date(profile.approvedAt).toLocaleDateString() : '-'}
                    </Text>
                  </Box>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default OwnerDashboard;
