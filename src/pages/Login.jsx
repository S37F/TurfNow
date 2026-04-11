import { Input, Button, Alert, Box, VStack, Text, HStack, Divider, Icon, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import loginBg from "../images/loginBg.png"
import googleimg from "../images/search.png"
import "../style/login.css"
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import Logo from "../components/Logo";
import { FiMail, FiLock } from "react-icons/fi";
import { supabase } from "../lib/supabase";

const getAuthErrorMessage = (err) => {
  const msg = err?.message || '';
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (lower.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (lower.includes('user already registered')) return 'An account already exists with this email.';
  if (lower.includes('invalid email')) return 'Invalid email address.';
  if (lower.includes('password')) return msg;
  if (lower.includes('network')) return 'Network error. Check your connection.';
  return msg || 'Something went wrong. Please try again.';
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
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetErr) throw resetErr;
        toast({
          title: "Reset email sent!",
          description: "Check your inbox for a password reset link.",
          status: "success",
          duration: 5000,
        });
      } catch (err) {
        setError(getAuthErrorMessage(err));
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
        setError(getAuthErrorMessage(err))
      } finally {
        setLoading(false);
      }
    }
    
    const signinWithgoogle = async () => {
      setLoading(true);
      setError("");
      try {
        await googleSignin()
      } catch (err) {
        setError(getAuthErrorMessage(err))
        setLoading(false);
      }
    }
    
  return (
    <Box id='mainLoginContainer'>
      <Box id='loginBg'>
        <img src={loginBg} alt="background" />
      </Box>
      <Box id='loginform'>
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
