import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  useToast,
  Heading,
  Avatar,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { reviewAPI } from '../services/api';
import { useUserAuth } from '../context/Authcontext';

export const TurfReviews = ({ sport, turfId, turfName }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUserAuth();
  const toast = useToast();

  useEffect(() => {
    loadReviews();
  }, [sport, turfId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getReviews(sport, turfId);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    try {
      setSubmitting(true);
      await reviewAPI.createReview({
        sport,
        turfId,
        rating,
        comment,
      });

      toast({
        title: 'Review submitted successfully',
        status: 'success',
        duration: 2000,
      });

      setRating(0);
      setComment('');
      loadReviews();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit review',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      toast({
        title: 'Review deleted',
        status: 'success',
        duration: 2000,
      });
      loadReviews();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        status: 'error',
        duration: 2000,
      });
    }
  };

  const StarRating = ({ value, onChange, readOnly = false }) => {
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            as={star <= value ? AiFillStar : AiOutlineStar}
            color="gold"
            fontSize="24px"
            cursor={readOnly ? 'default' : 'pointer'}
            onClick={() => !readOnly && onChange && onChange(star)}
          />
        ))}
      </HStack>
    );
  };

  const getRatingStats = () => {
    if (reviews.length === 0) return null;

    const stats = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
    })).reverse();

    const avgRating = (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    return { stats, avgRating };
  };

  const ratingStats = getRatingStats();

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        Reviews for {turfName}
      </Heading>

      {/* Rating Statistics */}
      {ratingStats && (
        <Box mb={6} p={4} bg="gray.50" borderRadius="md">
          <HStack spacing={8} align="start">
            <VStack>
              <Text fontSize="3xl" fontWeight="bold">
                {ratingStats.avgRating}
              </Text>
              <StarRating value={Math.round(parseFloat(ratingStats.avgRating))} readOnly />
              <Text fontSize="sm" color="gray.600">
                {reviews.length} reviews
              </Text>
            </VStack>
            <VStack flex={1} align="stretch" spacing={1}>
              {ratingStats.stats.map((stat) => (
                <HStack key={stat.star} spacing={2}>
                  <Text fontSize="sm" w="20px">
                    {stat.star}
                  </Text>
                  <AiFillStar color="gold" />
                  <Progress
                    value={stat.percentage}
                    flex={1}
                    colorScheme="yellow"
                    size="sm"
                  />
                  <Text fontSize="sm" w="40px" textAlign="right">
                    {stat.count}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Add Review Form */}
      {user && (
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Write a Review
          </Text>
          <VStack align="stretch" spacing={3}>
            <Box>
              <Text fontSize="sm" mb={1}>
                Your Rating
              </Text>
              <StarRating value={rating} onChange={setRating} />
            </Box>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={submitting}
              alignSelf="flex-start"
            >
              Submit Review
            </Button>
          </VStack>
        </Box>
      )}

      <Divider my={4} />

      {/* Reviews List */}
      <VStack align="stretch" spacing={4}>
        {loading ? (
          <Text>Loading reviews...</Text>
        ) : reviews.length === 0 ? (
          <Text color="gray.500">No reviews yet. Be the first to review!</Text>
        ) : (
          reviews.map((review) => (
            <Box key={review.id} p={4} bg="gray.50" borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Avatar size="sm" name={review.userEmail} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm">
                      {review.userEmail}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
                <StarRating value={review.rating} readOnly />
              </HStack>
              <Text>{review.comment}</Text>
              {user?.uid === review.userId && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  mt={2}
                  onClick={() => handleDelete(review.id)}
                >
                  Delete
                </Button>
              )}
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};
