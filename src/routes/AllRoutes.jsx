import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from "react-router-dom"
import { UserAuthContextProvider } from '../context/Authcontext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AdminProtectedRoute } from '../components/AdminProtectedRoute'
import { OwnerProtectedRoute } from '../components/OwnerProtectedRoute'
import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })))
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('../pages/Signup').then(m => ({ default: m.Signup })))
const OwnerSignup = lazy(() => import('../pages/OwnerSignup').then(m => ({ default: m.OwnerSignup })))
const TurfzListing = lazy(() => import('../pages/TurfzListing').then(m => ({ default: m.TurfzListing })))
const Payment = lazy(() => import('../pages/Payment').then(m => ({ default: m.Payment })))
const Bookings = lazy(() => import('../pages/Bookings').then(m => ({ default: m.Bookings })))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AddTurf = lazy(() => import('../pages/AddTurf').then(m => ({ default: m.AddTurf })))
const OwnerDashboard = lazy(() => import('../pages/OwnerDashboard').then(m => ({ default: m.OwnerDashboard })))
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })))

// Loading fallback component
const PageLoader = () => (
  <Center h="100vh" bg="#F1F5F9">
    <VStack spacing={4}>
      <Spinner size="xl" color="red.500" thickness="4px" />
      <Text color="gray.500">Loading...</Text>
    </VStack>
  </Center>
)

export const AllRoutes = () => {
  return (
    <UserAuthContextProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/owner-signup' element={<OwnerSignup />} />
          <Route path="/turf" element={
            <ProtectedRoute>
              <TurfzListing />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          {/* Owner routes */}
          <Route path="/owner/dashboard" element={
            <OwnerProtectedRoute>
              <OwnerDashboard />
            </OwnerProtectedRoute>
          } />
          <Route path="/owner/add-turf" element={
            <OwnerProtectedRoute>
              <AddTurf />
            </OwnerProtectedRoute>
          } />
          {/* Admin routes - requires admin role */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/add-turf" element={
            <AdminProtectedRoute>
              <AddTurf />
            </AdminProtectedRoute>
          } />
          {/* 404 - custom page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </UserAuthContextProvider>
  )
}
