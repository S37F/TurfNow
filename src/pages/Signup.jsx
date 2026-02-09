import React, { useState } from "react";
import loginBg from "../images/loginBg.png";
import { Button, Input, Alert, Box, VStack, Text, HStack, Divider, Icon, useToast } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import googleimg from "../images/search.png";
import "../style/login.css";
import Logo from "../components/Logo";
import { FiMail, FiLock } from "react-icons/fi";

const getFirebaseErrorMessage = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account already exists with this email.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/operation-not-allowed': return 'Email/password signup is not enabled.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    default: return 'Signup failed. Please try again.';
  }
};

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { signup, googleSignin } = useUserAuth()
    const navigate = useNavigate()
    const toast = useToast()
    
    const handlesignup = async (e) => {
        if (e) e.preventDefault();
        setError("")

        if (!email.trim()) {
          setError("Please enter your email address.");
          return;
        }
        if (pass.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        setLoading(true);
        try {
          await signup(email, pass)
          toast({
            title: "Account created!",
            description: "You can now sign in.",
            status: "success",
            duration: 3000,
          });
          navigate("/login")
        } catch (err) {
          setError(getFirebaseErrorMessage(err.code))
        } finally {
          setLoading(false);
        }
    }
    
    const signinWithgoogle = async () => {
      setLoading(true);
      try {
        await googleSignin()
        navigate("/turf")
      } catch (err) {
        setError(getFirebaseErrorMessage(err.code))
      } finally {
        setLoading(false);
      }
    }

  return (
    <Box id="mainLoginContainer">
      <Box id="loginBg">
        <img src={loginBg} alt="background" />
      </Box>
      <Box id="loginform">
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
          Create Account
        </Text>
        <Text textAlign="center" color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} mb={{ base: 3, md: 4 }}>
          Sign up to start booking turfs
        </Text>

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

        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
          <Box>
            <HStack mb={2}>
              <Icon as={FiMail} color="red.500" boxSize={{ base: 3.5, md: 4 }} />
              <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="gray.700">Email</Text>
            </HStack>
            <Input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              size={{ base: 'md', md: 'lg' }}
              borderRadius="lg"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              _placeholder={{ color: '#94A3B8' }}
              fontSize={{ base: 'sm', md: 'md' }}
            />
          </Box>
          
          <Box>
            <HStack mb={2}>
              <Icon as={FiLock} color="red.500" boxSize={{ base: 3.5, md: 4 }} />
              <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="gray.700">Password</Text>
            </HStack>
            <Input
              type="password"
              placeholder="Enter password (min 6 chars)"
              onChange={(e) => setPass(e.target.value)}
              size={{ base: 'md', md: 'lg' }}
              borderRadius="lg"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              _placeholder={{ color: '#94A3B8' }}
              fontSize={{ base: 'sm', md: 'md' }}
            />
          </Box>

          <Button 
            w="100%"
            size={{ base: 'md', md: 'lg' }}
            bg="linear-gradient(135deg, #DC2626, #B91C1C)"
            color="white"
            fontWeight="bold"
            borderRadius="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            _active={{ transform: 'translateY(0)' }}
            onClick={handlesignup}
            isLoading={loading}
            loadingText="Creating account..."
            fontSize={{ base: 'sm', md: 'md' }}
          >
            Create Account
          </Button>

          <HStack>
            <Divider />
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" whiteSpace="nowrap">or</Text>
            <Divider />
          </HStack>

          <Button 
            w="100%"
            size={{ base: 'md', md: 'lg' }}
            variant="outline"
            borderRadius="lg"
            border="2px solid"
            borderColor="gray.200"
            _hover={{ borderColor: 'red.500', bg: 'red.50' }}
            onClick={signinWithgoogle}
            leftIcon={<img src={googleimg} alt="Google" style={{ width: '18px', height: '18px' }} />}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            Continue with Google
          </Button>
        </VStack>

        <Text 
          textAlign='center' 
          color='gray.500'
          fontSize={{ base: 'xs', md: 'sm' }}
          mt={{ base: 4, md: 6 }}
        >
          Already have an account?{' '}
          <Link 
            to="/login"
            style={{ 
              color: '#DC2626', 
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Sign In
          </Link>
        </Text>

        <Text 
          textAlign='center' 
          color='gray.500'
          fontSize={{ base: 'xs', md: 'sm' }}
          mt={3}
          pb={2}
        >
          Own a turf?{' '}
          <Link 
            to="/owner-signup"
            style={{ 
              color: '#DC2626', 
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Register as Owner
          </Link>
        </Text>
      </Box> 
    </Box>
  )
}