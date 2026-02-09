import React, { useState } from "react";
import loginBg from "../images/loginBg.png";
import { 
  Button, Input, Alert, Box, VStack, Text, HStack, 
  Divider, Icon, Textarea, Select, useToast,
  FormControl, FormLabel, FormHelperText
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import "../style/login.css";
import Logo from "../components/Logo";
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiHome } from "react-icons/fi";
import { MdSportsSoccer } from "react-icons/md";
import api from "../services/api";

export const OwnerSignup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Step 1: Account details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Step 2: Personal & Business details
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    city: "",
    sportTypes: [],
    description: "",
  });

  const sportOptions = [
    { value: "football", label: "Football" },
    { value: "cricket", label: "Cricket" },
    { value: "basketball", label: "Basketball" },
    { value: "badminton", label: "Badminton" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSportSelect = (e) => {
    const value = e.target.value;
    if (value && !formData.sportTypes.includes(value)) {
      setFormData(prev => ({ 
        ...prev, 
        sportTypes: [...prev.sportTypes, value] 
      }));
    }
  };

  const removeSport = (sport) => {
    setFormData(prev => ({
      ...prev,
      sportTypes: prev.sportTypes.filter(s => s !== sport)
    }));
  };

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { fullName, phone, businessName, businessAddress, city, sportTypes } = formData;
    if (!fullName || !phone || !businessName || !businessAddress || !city) {
      setError("All fields are required");
      return false;
    }
    if (sportTypes.length === 0) {
      setError("Please select at least one sport type");
      return false;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Create Firebase account
      const userCredential = await signup(email, password);
      const uid = userCredential.user.uid;

      // Register as turf owner (pending approval)
      await api.post('/owners/register', {
        uid,
        email,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Registration Submitted!",
        description: "Your application is pending admin approval. You'll receive an email once approved.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box id="mainLoginContainer">
      <Box id="loginBg">
        <img src={loginBg} alt="background" />
      </Box>
      <Box id="loginform" maxW={{ base: "95%", md: "500px" }}>
        {/* Logo */}
        <Box textAlign="center" mb={{ base: 1, md: 2 }}>
          <Logo variant="full" size="md" color="gradient" />
        </Box>
        
        <Text 
          fontSize={{ base: 'xl', md: '2xl' }} 
          fontWeight="800" 
          textAlign="center"
          color="gray.800"
          fontFamily="'Poppins', sans-serif"
        >
          Turf Owner Registration
        </Text>
        <Text textAlign="center" color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} mb={{ base: 2, md: 3 }}>
          Step {step} of 2 - {step === 1 ? "Account Details" : "Business Information"}
        </Text>

        {/* Progress indicator */}
        <HStack justify="center" mb={4} spacing={2}>
          <Box w="60px" h="4px" borderRadius="full" bg={step >= 1 ? "red.500" : "gray.200"} />
          <Box w="60px" h="4px" borderRadius="full" bg={step >= 2 ? "red.500" : "gray.200"} />
        </HStack>

        {error && (
          <Alert 
            variant="subtle" 
            status='error'
            borderRadius="0.75rem"
            mb={4}
          >
            {error}
          </Alert>
        )}

        {step === 1 ? (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            <FormControl>
              <HStack mb={2}>
                <Icon as={FiMail} color="red.500" boxSize={{ base: 3.5, md: 4 }} />
                <FormLabel m={0} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="gray.700">Email</FormLabel>
              </HStack>
              <Input
                type="email"
                placeholder="Enter your business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size={{ base: 'md', md: 'lg' }}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              />
            </FormControl>
            
            <FormControl>
              <HStack mb={2}>
                <Icon as={FiLock} color="red.500" boxSize={{ base: 3.5, md: 4 }} />
                <FormLabel m={0} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="gray.700">Password</FormLabel>
              </HStack>
              <Input
                type="password"
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size={{ base: 'md', md: 'lg' }}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              />
            </FormControl>

            <FormControl>
              <HStack mb={2}>
                <Icon as={FiLock} color="red.500" boxSize={{ base: 3.5, md: 4 }} />
                <FormLabel m={0} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="gray.700">Confirm Password</FormLabel>
              </HStack>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size={{ base: 'md', md: 'lg' }}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              />
            </FormControl>

            <Button 
              w="100%"
              size={{ base: 'md', md: 'lg' }}
              bg="linear-gradient(135deg, #DC2626, #B91C1C)"
              color="white"
              fontWeight="bold"
              borderRadius="lg"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              onClick={handleNextStep}
            >
              Continue →
            </Button>
          </VStack>
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            <HStack spacing={3}>
              <FormControl>
                <HStack mb={2}>
                  <Icon as={FiUser} color="red.500" boxSize={4} />
                  <FormLabel m={0} fontSize="sm" fontWeight="700">Full Name</FormLabel>
                </HStack>
                <Input
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'red.500' }}
                />
              </FormControl>
              
              <FormControl>
                <HStack mb={2}>
                  <Icon as={FiPhone} color="red.500" boxSize={4} />
                  <FormLabel m={0} fontSize="sm" fontWeight="700">Phone</FormLabel>
                </HStack>
                <Input
                  name="phone"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'red.500' }}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <HStack mb={2}>
                <Icon as={FiHome} color="red.500" boxSize={4} />
                <FormLabel m={0} fontSize="sm" fontWeight="700">Business/Turf Name</FormLabel>
              </HStack>
              <Input
                name="businessName"
                placeholder="e.g., Green Field Sports Arena"
                value={formData.businessName}
                onChange={handleInputChange}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500' }}
              />
            </FormControl>

            <HStack spacing={3}>
              <FormControl flex={2}>
                <HStack mb={2}>
                  <Icon as={FiMapPin} color="red.500" boxSize={4} />
                  <FormLabel m={0} fontSize="sm" fontWeight="700">Address</FormLabel>
                </HStack>
                <Input
                  name="businessAddress"
                  placeholder="Full address"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'red.500' }}
                />
              </FormControl>
              
              <FormControl flex={1}>
                <HStack mb={2}>
                  <FormLabel m={0} fontSize="sm" fontWeight="700">City</FormLabel>
                </HStack>
                <Input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'red.500' }}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <HStack mb={2}>
                <Icon as={MdSportsSoccer} color="red.500" boxSize={4} />
                <FormLabel m={0} fontSize="sm" fontWeight="700">Sport Types Offered</FormLabel>
              </HStack>
              <Select 
                placeholder="Select sports you offer" 
                onChange={handleSportSelect}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500' }}
              >
                {sportOptions.map(sport => (
                  <option key={sport.value} value={sport.value}>{sport.label}</option>
                ))}
              </Select>
              <HStack mt={2} wrap="wrap" gap={2}>
                {formData.sportTypes.map(sport => (
                  <Box 
                    key={sport}
                    bg="red.100" 
                    color="red.700" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="sm"
                    cursor="pointer"
                    onClick={() => removeSport(sport)}
                    _hover={{ bg: 'red.200' }}
                  >
                    {sport} ✕
                  </Box>
                ))}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">Description (Optional)</FormLabel>
              <Textarea
                name="description"
                placeholder="Tell us about your turf facilities..."
                value={formData.description}
                onChange={handleInputChange}
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'red.500' }}
                rows={3}
              />
            </FormControl>

            <HStack spacing={3}>
              <Button 
                flex={1}
                size="lg"
                variant="outline"
                borderRadius="lg"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button 
                flex={2}
                size="lg"
                bg="linear-gradient(135deg, #DC2626, #B91C1C)"
                color="white"
                fontWeight="bold"
                borderRadius="lg"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Submitting..."
              >
                Submit Application
              </Button>
            </HStack>
          </VStack>
        )}

        <HStack justify="center" mt={4}>
          <Divider w="30%" />
          <Text fontSize="sm" color="gray.500">or</Text>
          <Divider w="30%" />
        </HStack>

        <Text textAlign='center' mt={3} fontSize="sm">
          Already have an account?{" "}
          <Link to='/login' style={{ color: '#DC2626', fontWeight: '600' }}>
            Login here
          </Link>
        </Text>
        
        <Text textAlign='center' mt={2} fontSize="sm">
          Just want to book?{" "}
          <Link to='/signup' style={{ color: '#DC2626', fontWeight: '600' }}>
            Customer Signup
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default OwnerSignup;
