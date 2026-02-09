import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TurfCard } from '../components/TurfCard';

const mockTurf = {
  id: 'turf-1',
  name: 'Green Arena',
  address: '123 Sports Lane, Mumbai',
  image: 'https://example.com/turf.jpg',
  pricePerHour: 1200,
  rating: 4.5,
  totalReviews: 28,
  available: true,
  popular: false,
  capacity: 10,
  facilities: ['Floodlights', 'Parking', 'Changing Room', 'Water'],
};

const renderTurfCard = (turf = mockTurf, onBookClick = () => {}) => {
  return render(
    <ChakraProvider>
      <TurfCard turf={turf} onBookClick={onBookClick} />
    </ChakraProvider>
  );
};

describe('TurfCard Component', () => {
  it('renders turf name', () => {
    renderTurfCard();
    expect(screen.getByText('Green Arena')).toBeInTheDocument();
  });

  it('renders turf address', () => {
    renderTurfCard();
    expect(screen.getByText('123 Sports Lane, Mumbai')).toBeInTheDocument();
  });

  it('renders price per hour', () => {
    renderTurfCard();
    expect(screen.getByText('₹1200')).toBeInTheDocument();
  });

  it('renders rating when > 0', () => {
    renderTurfCard();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(28)')).toBeInTheDocument();
  });

  it('does not render rating when 0', () => {
    renderTurfCard({ ...mockTurf, rating: 0 });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders Available badge when available', () => {
    renderTurfCard();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders Popular badge when popular', () => {
    renderTurfCard({ ...mockTurf, popular: true });
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('renders first 3 facilities plus overflow count', () => {
    renderTurfCard();
    expect(screen.getByText('Floodlights')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
    expect(screen.getByText('Changing Room')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders Book Now button', () => {
    renderTurfCard();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('calls onBookClick with turf data when Book Now is clicked', async () => {
    const onBookClick = vi.fn();
    renderTurfCard(mockTurf, onBookClick);

    const button = screen.getByRole('button', { name: /book now/i });
    button.click();
    expect(onBookClick).toHaveBeenCalledWith(mockTurf);
  });

  it('renders "Location not specified" when address is missing', () => {
    renderTurfCard({ ...mockTurf, address: '' });
    expect(screen.getByText('Location not specified')).toBeInTheDocument();
  });

  it('renders capacity when provided', () => {
    renderTurfCard();
    expect(screen.getByText('10 players')).toBeInTheDocument();
  });

  it('renders /hr text', () => {
    renderTurfCard();
    expect(screen.getByText('/hr')).toBeInTheDocument();
  });
});
