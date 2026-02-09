import { Input, Button, Alert, Box, VStack, Text, HStack, Divider, Icon, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import loginBg from "../images/loginBg.png"
import googleimg from "../images/search.png"
import "../style/login.css"
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import Logo from "../components/Logo";
import { FiMail, FiLock } from "react-icons/fi";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase-config/config";

const getFirebaseErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled. Please enable Email/Password in Firebase Console → Authentication → Sign-in method.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.': return 'Invalid Firebase API key. Check your environment configuration.';
    case 'auth/configuration-not-found': return 'Firebase Auth is not configured for this project. Enable Authentication in Firebase Console.';
    case 'auth/admin-restricted-operation': return 'Sign-up is restricted. Contact the administrator.';
    default: return `Login failed (${code || 'unknown'}). Please try again.`;
  }
};

export const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login, googleSignin } = useUserAuth()
    const navigate = useNavigate()
    const toast = useToast()

    const handleForgotPassword = async () => {
      if (!email.trim()) {
        setError("Please enter your email address first.");
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: "Reset email sent!",
          description: "Check your inbox for a password reset link.",
          status: "success",
          duration: 5000,
        });
      } catch (err) {
        setError(getFirebaseErrorMessage(err.code));
      }
    };

    const handlesignin = async (e) => {
      if (e) e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      if (!pass) {
        setError("Please enter your password.");
        return;
      }

      setLoading(true);
      try {
        await login(email, pass)
        toast({
          title: "Welcome back!",
          description: "Login successful",
          status: "success",
          duration: 2000,
        });
        navigate("/turf")
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
    <Box id='mainLoginContainer'>
      <Box id='loginBg'>
        <img src={loginBg} alt="background" />
      </Box>
      <Box id='loginform'>
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
          Welcome Back
        </Text>
        <Text textAlign="center" color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} mb={{ base: 3, md: 4 }}>
          Sign in to continue booking turfs
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
              placeholder='Enter your email' 
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
              placeholder='Enter your password' 
              onChange={(e) => setPass(e.target.value)}
              size={{ base: 'md', md: 'lg' }}
              borderRadius="lg"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #DC2626' }}
              _placeholder={{ color: '#94A3B8' }}
              fontSize={{ base: 'sm', md: 'md' }}
            />
            <Text
              fontSize="xs"
              color="red.500"
              fontWeight="600"
              cursor="pointer"
              textAlign="right"
              mt={1}
              _hover={{ textDecoration: 'underline' }}
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </Text>
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
            onClick={handlesignin}
            isLoading={loading}
            loadingText="Signing in..."
            fontSize={{ base: 'sm', md: 'md' }}
          >
            Sign In
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
          Don't have an account?{' '}
          <Link 
            to="/signup"
            style={{ 
              color: '#DC2626', 
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Sign Up
          </Link>
        </Text>
      </Box> 
    </Box>
  )
}
