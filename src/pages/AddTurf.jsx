import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  Checkbox,
  SimpleGrid,
  Flex,
  HStack,
  Text,
  Icon,
  Badge,
  Show,
  Hide,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdSportsSoccer, MdSave, MdLocationOn, MdImage, MdAttachMoney } from 'react-icons/md';
import { turfAPI } from '../services/api';
import Logo from '../components/Logo';

export const AddTurf = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    image: '',
    pricePerHour: '',
    facilities: [],
    available: true,
  });
  const [sport, setSport] = useState('football');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const facilityOptions = [
    'Floodlights',
    'Changing Rooms',
    'Parking',
    'Cafeteria',
    'First Aid',
    'Equipment Rental',
    'Coaching',
    'AC Rooms',
    'Seating',
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFacilityToggle = (facility) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.includes(facility)
        ? formData.facilities.filter((f) => f !== facility)
        : [...formData.facilities, facility],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        pricePerHour: parseInt(formData.pricePerHour),
      };

      await turfAPI.createTurf(sport, data);

      toast({
        title: 'Success',
        description: 'Turf added successfully',
        status: 'success',
        duration: 3000,
      });

      navigate('/admin');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add turf',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/admin">
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
          
          <Badge 
            colorScheme="green" 
            px={{ base: 2, md: 3 }} 
            py={1} 
            borderRadius="full"
            fontSize={{ base: 'xs', md: 'sm' }}
          >
            Add New Turf
          </Badge>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        <Box maxW="800px" mx="auto">
          {/* Header */}
          <Box mb={{ base: 4, md: 6 }}>
            <Heading 
              size={{ base: 'md', md: 'lg' }} 
              color="gray.800"
              fontFamily="'Poppins', sans-serif"
            >
              Add New Turf
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500">
              Fill in the details to add a new sports venue
            </Text>
          </Box>

          {/* Form Card */}
          <Box 
            bg="white" 
            p={{ base: 4, md: 8 }} 
            borderRadius="xl" 
            boxShadow="0 4px 20px rgba(0,0,0,0.08)"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={{ base: 4, md: 6 }}>
                {/* Sport Type */}
                <FormControl isRequired>
                  <FormLabel 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color="gray.700"
                  >
                    <HStack spacing={2}>
                      <Icon as={MdSportsSoccer} color="red.500" />
                      <Text>Sport Type</Text>
                    </HStack>
                  </FormLabel>
                  <Select 
                    value={sport} 
                    onChange={(e) => setSport(e.target.value)}
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    focusBorderColor="red.500"
                  >
                    <option value="football">⚽ Football</option>
                    <option value="cricket">🏏 Cricket</option>
                    <option value="basketball">🏀 Basketball</option>
                    <option value="badminton">🏸 Badminton</option>
                  </Select>
                </FormControl>

                {/* Turf Name */}
                <FormControl isRequired>
                  <FormLabel 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color="gray.700"
                  >
                    Turf Name
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Elite Football Arena"
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    focusBorderColor="red.500"
                  />
                </FormControl>

                {/* Address */}
                <FormControl isRequired>
                  <FormLabel 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color="gray.700"
                  >
                    <HStack spacing={2}>
                      <Icon as={MdLocationOn} color="red.500" />
                      <Text>Address</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Sports Complex, Andheri West, Mumbai"
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    focusBorderColor="red.500"
                    rows={3}
                  />
                </FormControl>

                {/* City & Price Row */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                  <FormControl isRequired>
                    <FormLabel 
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight="600"
                      color="gray.700"
                    >
                      City
                    </FormLabel>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Mumbai"
                      size={{ base: 'md', md: 'lg' }}
                      borderRadius="lg"
                      focusBorderColor="red.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight="600"
                      color="gray.700"
                    >
                      <HStack spacing={2}>
                        <Icon as={MdAttachMoney} color="red.500" />
                        <Text>Price Per Hour (₹)</Text>
                      </HStack>
                    </FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        value={formData.pricePerHour}
                        onChange={(e) => handleChange('pricePerHour', e.target.value)}
                        placeholder="1500"
                        borderRadius="lg"
                        height={{ base: '40px', md: '48px' }}
                      />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Image URL */}
                <FormControl isRequired>
                  <FormLabel 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color="gray.700"
                  >
                    <HStack spacing={2}>
                      <Icon as={MdImage} color="red.500" />
                      <Text>Image URL</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    focusBorderColor="red.500"
                  />
                </FormControl>

                {/* Facilities */}
                <FormControl>
                  <FormLabel 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color="gray.700"
                    mb={3}
                  >
                    Facilities
                  </FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {facilityOptions.map((facility) => (
                      <Checkbox
                        key={facility}
                        isChecked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        colorScheme="red"
                        size={{ base: 'sm', md: 'md' }}
                      >
                        <Text fontSize={{ base: 'xs', md: 'sm' }}>{facility}</Text>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </FormControl>

                {/* Availability */}
                <FormControl>
                  <Checkbox
                    isChecked={formData.available}
                    onChange={(e) => handleChange('available', e.target.checked)}
                    colorScheme="green"
                    size={{ base: 'sm', md: 'md' }}
                  >
                    <Text fontSize={{ base: 'sm', md: 'md' }}>Available for booking</Text>
                  </Checkbox>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="red"
                  width="full"
                  size={{ base: 'md', md: 'lg' }}
                  isLoading={loading}
                  loadingText="Adding..."
                  mt={4}
                  borderRadius="full"
                  leftIcon={<MdSave />}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                >
                  Add Turf
                </Button>
              </VStack>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
