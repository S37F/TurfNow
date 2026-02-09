import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Show,
  Hide,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdSportsSoccer, MdPeople, MdCalendarToday, MdSportsBasketball, MdAdd, MdRefresh, MdBusiness, MdCheck, MdClose } from 'react-icons/md';
import { adminAPI, ownerAPI, turfAPI } from '../services/api';
import { useUserAuth } from '../context/Authcontext';
import Logo from '../components/Logo';
import { PopoverProfile } from '../components/Popover';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [allTurfs, setAllTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      const [statsRes, bookingsRes, usersRes, ownersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllBookings(),
        adminAPI.getAllUsers(),
        ownerAPI.getAllOwners(),
      ]);

      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setOwners(ownersRes.data.data || []);

      // Fetch turfs for all sports
      const sports = ['football', 'cricket', 'basketball', 'badminton'];
      const turfResults = await Promise.all(
        sports.map(sport => turfAPI.getTurfsBySport(sport).catch(() => ({ data: { data: [] } })))
      );
      const turfs = turfResults.flatMap((res, i) =>
        (res.data?.data || []).map(t => ({ ...t, sport: sports[i] }))
      );
      setAllTurfs(turfs);
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set default empty data on error
      setStats({ totalTurfs: 0, totalBookings: 0, totalUsers: 0 });
      setBookings([]);
      setUsers([]);
      setOwners([]);
      setAllTurfs([]);
      toast({
        title: 'Note',
        description: 'Using demo data - backend may not be running',
        status: 'info',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await adminAPI.makeAdmin(userId);
      toast({
        title: 'Success',
        description: 'User is now an admin',
        status: 'success',
        duration: 3000,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to make admin',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleApproveOwner = async (ownerId) => {
    try {
      await ownerAPI.approveOwner(ownerId);
      toast({
        title: 'Owner Approved',
        description: 'The turf owner has been approved and notified via email',
        status: 'success',
        duration: 3000,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to approve owner',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRejectOwner = async () => {
    if (!selectedOwner) return;
    try {
      await ownerAPI.rejectOwner(selectedOwner.id, rejectReason);
      toast({
        title: 'Owner Rejected',
        description: 'The application has been rejected',
        status: 'info',
        duration: 3000,
      });
      onClose();
      setSelectedOwner(null);
      setRejectReason('');
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reject owner',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openRejectModal = (owner) => {
    setSelectedOwner(owner);
    setRejectReason('');
    onOpen();
  };

  const pendingOwners = owners.filter(o => o.status === 'pending');
  const approvedOwners = owners.filter(o => o.status === 'approved');

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
        <Box 
          p={3} 
          borderRadius="lg" 
          bg={`${color}.50`}
        >
          <Icon as={icon} boxSize={{ base: 5, md: 6 }} color={`${color}.500`} />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="500">
            {label}
          </Text>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="gray.800">
            {value}
          </Text>
          <Text fontSize={{ base: 'xs', md: 'xs' }} color="gray.400">
            {helpText}
          </Text>
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
          px={{ base: 3, md: 6 }}
          py={{ base: 3, md: 4 }}
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
            <Hide below="sm">
              <Logo variant="full" size="sm" color="white" />
            </Hide>
            <Show below="sm">
              <Logo variant="icon" size="sm" color="white" />
            </Show>
          </HStack>
          
          <HStack spacing={{ base: 2, md: 4 }}>
            <Badge 
              colorScheme="purple" 
              px={{ base: 2, md: 3 }} 
              py={1} 
              borderRadius="full"
              fontSize={{ base: 'xs', md: 'sm' }}
            >
              Admin Panel
            </Badge>
            <PopoverProfile handleLogout={handleLogout} email={user?.email} />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        <Box maxW="1400px" mx="auto">
          {/* Header */}
          <Flex 
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }} 
            mb={{ base: 4, md: 6 }}
            flexDirection={{ base: 'column', sm: 'row' }}
            gap={3}
          >
            <Box>
              <Heading 
                size={{ base: 'md', md: 'lg' }} 
                color="gray.800"
                fontFamily="'Poppins', sans-serif"
              >
                Admin Dashboard
              </Heading>
              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500">
                Manage turfs, bookings, and users
              </Text>
            </Box>
            <Button
              leftIcon={<MdRefresh />}
              colorScheme="gray"
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
              onClick={loadData}
              isLoading={loading}
            >
              Refresh
            </Button>
          </Flex>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={{ base: 3, md: 6 }} mb={{ base: 4, md: 8 }}>
            <StatCard 
              icon={MdSportsSoccer} 
              label="Total Turfs" 
              value={stats?.totalTurfs || 0} 
              helpText="All sports"
              color="red"
            />
            <StatCard 
              icon={MdCalendarToday} 
              label="Bookings" 
              value={stats?.totalBookings || bookings.length} 
              helpText="Active"
              color="green"
            />
            <StatCard 
              icon={MdPeople} 
              label="Users" 
              value={stats?.totalUsers || users.length} 
              helpText="Registered"
              color="blue"
            />
            <StatCard 
              icon={MdBusiness} 
              label="Owners" 
              value={approvedOwners.length} 
              helpText={`${pendingOwners.length} pending`}
              color="purple"
            />
            <StatCard 
              icon={MdSportsBasketball} 
              label="Sports" 
              value="4" 
              helpText="Available"
              color="orange"
            />
          </SimpleGrid>

          {/* Tabs */}
          <Tabs colorScheme="red" variant="enclosed-colored">
            <TabList 
              bg="white" 
              borderRadius="xl" 
              p={1} 
              boxShadow="sm"
              overflowX="auto"
              css={{
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none'
              }}
            >
              <Tab 
                borderRadius="lg" 
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _selected={{ bg: 'red.500', color: 'white' }}
              >
                📅 Bookings
              </Tab>
              <Tab 
                borderRadius="lg" 
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _selected={{ bg: 'red.500', color: 'white' }}
              >
                👥 Users
              </Tab>
              <Tab 
                borderRadius="lg" 
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _selected={{ bg: 'red.500', color: 'white' }}
              >
                🏢 Owners {pendingOwners.length > 0 && (
                  <Badge ml={2} colorScheme="yellow" borderRadius="full">
                    {pendingOwners.length}
                  </Badge>
                )}
              </Tab>
              <Tab 
                borderRadius="lg" 
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _selected={{ bg: 'red.500', color: 'white' }}
              >
                ⚽ Manage Turfs
              </Tab>
            </TabList>

            <TabPanels mt={4}>
              {/* Bookings Tab */}
              <TabPanel p={0}>
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6 }} 
                  borderRadius="xl" 
                  boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="gray.800">
                      All Bookings ({bookings.length})
                    </Heading>
                  </Flex>
                  
                  {bookings.length === 0 ? (
                    <Center py={10}>
                      <VStack>
                        <Text fontSize="4xl">📅</Text>
                        <Text color="gray.500">No bookings yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead bg="gray.50">
                          <Tr>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>User</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Turf</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>Date</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Time</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {bookings.map((booking, index) => (
                            <Tr key={index} _hover={{ bg: 'gray.50' }}>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} maxW="150px" isTruncated>
                                {booking.email}
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }}>{booking.turfName}</Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>
                                {booking.bookingDate}
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }}>{booking.time}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={booking.status === 'confirmed' ? 'green' : booking.status === 'cancelled' ? 'red' : 'yellow'}
                                  borderRadius="full"
                                  px={2}
                                  fontSize={{ base: 'xs', md: 'xs' }}
                                >
                                  {booking.status || 'pending'}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </TabPanel>

              {/* Users Tab */}
              <TabPanel p={0}>
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6 }} 
                  borderRadius="xl" 
                  boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="gray.800">
                      All Users ({users.length})
                    </Heading>
                  </Flex>
                  
                  {users.length === 0 ? (
                    <Center py={10}>
                      <VStack>
                        <Text fontSize="4xl">👥</Text>
                        <Text color="gray.500">No users yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead bg="gray.50">
                          <Tr>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Email</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>Name</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>Created</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Role</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {users.map((userData, index) => (
                            <Tr key={index} _hover={{ bg: 'gray.50' }}>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} maxW="150px" isTruncated>
                                {userData.email}
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>
                                {userData.displayName || 'N/A'}
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>
                                {new Date(userData.createdAt).toLocaleDateString()}
                              </Td>
                              <Td>
                                <Badge 
                                  colorScheme={userData.isAdmin ? 'purple' : 'gray'}
                                  borderRadius="full"
                                  px={2}
                                  fontSize={{ base: 'xs', md: 'xs' }}
                                >
                                  {userData.isAdmin ? 'Admin' : 'User'}
                                </Badge>
                              </Td>
                              <Td>
                                {!userData.isAdmin && userData.uid !== user?.uid && (
                                  <Button
                                    size={{ base: 'xs', md: 'sm' }}
                                    colorScheme="purple"
                                    onClick={() => handleMakeAdmin(userData.uid)}
                                    borderRadius="full"
                                  >
                                    Make Admin
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </TabPanel>

              {/* Owners Tab */}
              <TabPanel p={0}>
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6 }} 
                  borderRadius="xl" 
                  boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="gray.800">
                      Owner Applications
                    </Heading>
                    <HStack>
                      <Badge colorScheme="yellow">{pendingOwners.length} Pending</Badge>
                      <Badge colorScheme="green">{approvedOwners.length} Approved</Badge>
                    </HStack>
                  </Flex>
                  
                  {owners.length === 0 ? (
                    <Center py={10}>
                      <VStack>
                        <Text fontSize="4xl">🏢</Text>
                        <Text color="gray.500">No owner applications yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead bg="gray.50">
                          <Tr>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Business</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Owner</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>City</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>Sports</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Status</Th>
                            <Th fontSize={{ base: 'xs', md: 'sm' }}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {owners.map((owner, index) => (
                            <Tr key={index} _hover={{ bg: 'gray.50' }}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="600" fontSize={{ base: 'xs', md: 'sm' }}>{owner.businessName}</Text>
                                  <Text fontSize="xs" color="gray.500">{owner.email}</Text>
                                </VStack>
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }}>
                                <VStack align="start" spacing={0}>
                                  <Text>{owner.fullName}</Text>
                                  <Text fontSize="xs" color="gray.500">{owner.phone}</Text>
                                </VStack>
                              </Td>
                              <Td fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>
                                {owner.city}
                              </Td>
                              <Td display={{ base: 'none', md: 'table-cell' }}>
                                <HStack wrap="wrap" gap={1}>
                                  {owner.sportTypes?.slice(0, 2).map((sport, i) => (
                                    <Badge key={i} colorScheme="blue" fontSize="xs" textTransform="capitalize">
                                      {sport}
                                    </Badge>
                                  ))}
                                  {owner.sportTypes?.length > 2 && (
                                    <Badge colorScheme="gray" fontSize="xs">+{owner.sportTypes.length - 2}</Badge>
                                  )}
                                </HStack>
                              </Td>
                              <Td>
                                <Badge 
                                  colorScheme={
                                    owner.status === 'approved' ? 'green' : 
                                    owner.status === 'rejected' ? 'red' : 'yellow'
                                  }
                                  borderRadius="full"
                                  px={2}
                                  fontSize={{ base: 'xs', md: 'xs' }}
                                >
                                  {owner.status}
                                </Badge>
                              </Td>
                              <Td>
                                {owner.status === 'pending' && (
                                  <HStack spacing={2}>
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      leftIcon={<MdCheck />}
                                      onClick={() => handleApproveOwner(owner.id)}
                                      borderRadius="full"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      variant="outline"
                                      leftIcon={<MdClose />}
                                      onClick={() => openRejectModal(owner)}
                                      borderRadius="full"
                                    >
                                      Reject
                                    </Button>
                                  </HStack>
                                )}
                                {owner.status === 'approved' && (
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(owner.approvedAt).toLocaleDateString()}
                                  </Text>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </TabPanel>

              {/* Manage Turfs Tab */}
              <TabPanel p={0}>
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6 }} 
                  borderRadius="xl" 
                  boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                >
                  <Flex 
                    justify="space-between" 
                    align={{ base: 'start', sm: 'center' }}
                    flexDirection={{ base: 'column', sm: 'row' }}
                    gap={3}
                    mb={6}
                  >
                    <Box>
                      <Heading size={{ base: 'sm', md: 'md' }} color="gray.800">
                        Manage Turfs
                      </Heading>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                        Add, edit, or remove turfs
                      </Text>
                    </Box>
                    <Link to="/admin/add-turf">
                      <Button 
                        leftIcon={<MdAdd />}
                        colorScheme="red" 
                        size={{ base: 'sm', md: 'md' }}
                        borderRadius="full"
                        px={6}
                        _hover={{ transform: 'translateY(-2px)' }}
                      >
                        Add New Turf
                      </Button>
                    </Link>
                  </Flex>
                  
                  {allTurfs.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={3}>
                      <Text fontSize="4xl">⚽</Text>
                      <Text color="gray.500" textAlign="center">
                        No turfs added yet. Click "Add New Turf" to add a venue.
                      </Text>
                    </VStack>
                  </Center>
                  ) : (
                  <TableContainer>
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontSize={{ base: 'xs', md: 'sm' }}>Name</Th>
                          <Th fontSize={{ base: 'xs', md: 'sm' }}>Sport</Th>
                          <Th fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>City</Th>
                          <Th fontSize={{ base: 'xs', md: 'sm' }}>Price/hr</Th>
                          <Th fontSize={{ base: 'xs', md: 'sm' }}>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {allTurfs.map((turf, idx) => (
                          <Tr key={idx} _hover={{ bg: 'gray.50' }}>
                            <Td fontWeight="500" fontSize={{ base: 'xs', md: 'sm' }}>{turf.name}</Td>
                            <Td>
                              <Badge colorScheme="blue" textTransform="capitalize" fontSize="xs">{turf.sport}</Badge>
                            </Td>
                            <Td fontSize={{ base: 'xs', md: 'sm' }} display={{ base: 'none', md: 'table-cell' }}>
                              {turf.city || 'N/A'}
                            </Td>
                            <Td fontWeight="600" fontSize={{ base: 'xs', md: 'sm' }}>₹{turf.pricePerHour}</Td>
                            <Td>
                              <Badge colorScheme={turf.available !== false ? 'green' : 'red'} fontSize="xs">
                                {turf.available !== false ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      {/* Reject Owner Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Owner Application</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to reject <strong>{selectedOwner?.businessName}</strong>?
            </Text>
            <Textarea
              placeholder="Reason for rejection (optional but recommended)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRejectOwner}>
              Reject Application
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
