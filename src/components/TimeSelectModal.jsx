import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Text,
  Alert,
  AlertIcon,
  Box,
  Input,
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Authcontext";
import { bookingAPI } from "../services/api";

const TIME_SLOTS = [
  "5:00 AM",
  "7:00 AM",
  "9:00 AM",
  "4:00 PM",
  "6:00 PM",
  "8:00 PM",
  "10:00 PM",
];

// Get today's date in YYYY-MM-DD format for min date
const getTodayStr = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const TimeSelectModal = (prop) => {
  const { turf, element, setElement, setTime, setTurfName, turfName } = prop;
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [date, setDate] = useState("");

  const handleElement = (ele) => {
    setElement(ele);
    setTurfName(ele.name);
  };

  // Fetch booked slots when date changes
  const fetchBookedSlots = useCallback(async () => {
    if (!date || !turfName) {
      setBookedSlots([]);
      return;
    }
    try {
      const response = await bookingAPI.getBookedSlots(turfName, date);
      const slots = response.data?.data || [];
      // Backend returns array of time strings directly
      setBookedSlots(slots);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setBookedSlots([]);
    }
  }, [date, turfName]);

  useEffect(() => {
    if (isOpen && date && turfName) {
      fetchBookedSlots();
    }
  }, [isOpen, date, turfName, fetchBookedSlots]);

  const addBookings = async (timeSlot) => {
    if (!date) {
      toast({
        title: "Select a date",
        description: "Please select a date before choosing a time slot.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (bookedSlots.includes(timeSlot)) {
      toast({
        title: "Slot unavailable",
        description: "This time slot is already booked for the selected date.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setBookingInProgress(true);
    try {
      const bookingData = {
        booking: {
          name: element.name,
          image: element.image || "",
          address: element.address || "",
          pricePerHour: element.pricePerHour || 0,
        },
        sport: turf,
        time: timeSlot,
        bookingDate: date,
      };

      await bookingAPI.createBooking(bookingData);

      setTime(timeSlot);
      toast({
        title: "Booked successfully!",
        description: `${element.name} on ${date} at ${timeSlot}`,
        status: "success",
        duration: 3000,
      });
      onClose();
      navigate("/payment");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create booking";
      toast({
        title: "Booking failed",
        description: errorMsg,
        status: "error",
        duration: 4000,
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <>
      <Button
        colorScheme={"red"}
        size={{ base: 'sm', md: 'md' }}
        fontSize={{ base: 'xs', md: 'sm' }}
        onClick={() => {
          handleElement(element);
          setDate("");
          setBookedSlots([]);
          onOpen();
        }}
      >
        Book Now
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: 'md' }}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent mx={{ base: 3, md: 4 }} borderRadius="xl">
          <ModalHeader fontSize={{ base: 'md', md: 'lg' }} pb={2}>
            Timings For {turf}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={2}>
            <Text fontWeight={"bold"} fontSize={{ base: 'lg', md: 'xl' }} color={"red.500"} mb={2}>
              Booking for "{turfName}"
            </Text>
            <Text fontWeight={"bold"} fontSize={{ base: 'md', md: 'lg' }} mb={2}>Select Date</Text>
            <Input
              type={"date"}
              min={getTodayStr()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size={{ base: 'sm', md: 'md' }}
              mb={3}
            />
            <Text fontWeight={"bold"} fontSize={{ base: 'md', md: 'lg' }} mb={2}>
              Select Time
            </Text>
            <div id="timeButtons">
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <Button
                    key={slot}
                    colorScheme={isBooked ? "gray" : "red"}
                    size={{ base: 'sm', md: 'md' }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    isDisabled={isBooked || bookingInProgress || !date}
                    onClick={() => addBookings(slot)}
                    opacity={isBooked ? 0.5 : 1}
                    title={isBooked ? "Already booked" : ""}
                  >
                    {slot}
                    {isBooked && " ✗"}
                  </Button>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter pt={2}>
            <Button onClick={onClose} size={{ base: 'sm', md: 'md' }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
