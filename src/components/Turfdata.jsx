import React, { useEffect, useState } from "react";
import { db } from "../firebase-config/config";
import { collection, getDocs } from "firebase/firestore";
import { SimpleGrid, Box, Text, Center, VStack, Button, Alert, AlertIcon } from "@chakra-ui/react";
import { Loading } from "./Loading";
import { TimeSelectModal } from "./TimeSelectModal";
import { TurfFilters } from "./TurfFilters";
import { TurfCard } from "./TurfCard";
import { turfAPI } from "../services/api";

export const Turfdata = (prop) => {
  const { turf } = prop;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [element,setElement] = useState({})
  const [time,setTime] = useState("")
  const [turfName,setTurfName] = useState("")
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    priceRange: [0, 3000],
    sortBy: '',
  });


  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      try {
        // Try Firestore client SDK first
        const ref = collection(db, turf);
        const turfData = await getDocs(ref);
        const filterData = turfData.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(filterData);
        setFilteredData(filterData);
        setError(null);
      } catch (err) {
        console.warn('Firestore client failed, falling back to API:', err.message);
        try {
          // Fallback: fetch from backend API
          const res = await turfAPI.getTurfsBySport(turf);
          const apiData = res.data?.data || [];
          setData(apiData);
          setFilteredData(apiData);
          setError(null);
        } catch (apiErr) {
          console.error('API fallback also failed:', apiErr);
          setError('Failed to load turfs. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [turf]);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter((item) => item.city === filters.city);
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (item) =>
          item.pricePerHour >= filters.priceRange[0] &&
          item.pricePerHour <= filters.priceRange[1]
      );
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      city: '',
      priceRange: [0, 3000],
      sortBy: '',
    });
  };

  if (loading) {
    return (
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Loading />
      </Box>
    );
  }
 
  return (
    <Box bg="#F1F5F9" minH="50vh" pb={8}>
      {/* Error State */}
      {error && (
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} pt={6}>
          <Alert status="error" borderRadius="lg" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        </Box>
      )}

      {/* Filters */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} pt={6}>
        <TurfFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </Box>

      {/* Results Header */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} mb={4}>
        <p id="headingTurf">
          {filteredData.length} {turf} {filteredData.length === 1 ? 'turf' : 'turfs'} available
        </p>
      </Box>

      {/* Turf Cards */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        {filteredData.length === 0 ? (
          <Box 
            textAlign="center" 
            py={16} 
            bg="white" 
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box fontSize="4xl" mb={4}>🏟️</Box>
            <Box fontSize="xl" fontWeight="bold" color="gray.700" mb={2}>
              No turfs found
            </Box>
            <Box color="gray.500">
              Try adjusting your filters or search for a different sport
            </Box>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredData.map((ele) => {
              return (
                <Box key={ele.id}>
                  <TurfCard turf={ele} onBookClick={(turf) => {
                    setElement(turf);
                    setTurfName(turf.name);
                  }} />
                  <Box mt={3}>
                    <TimeSelectModal 
                      turf={turf} 
                      element={ele} 
                      turfName={turfName} 
                      setTurfName={setTurfName} 
                      setElement={setElement} 
                      setTime={setTime} 
                      id={ele.id}
                    />
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};
