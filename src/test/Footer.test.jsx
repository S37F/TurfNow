import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../components/Footer';

// Mock the Logo component
vi.mock('../components/Logo', () => ({
  default: ({ variant, size, color }) => (
    <div data-testid="logo" data-variant={variant} data-size={size} data-color={color}>
      TurfNow Logo
    </div>
  ),
}));

const renderFooter = () => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('Footer Component', () => {
  it('renders the Logo component', () => {
    renderFooter();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders tagline text', () => {
    renderFooter();
    expect(screen.getByText(/Find and book your nearest/i)).toBeInTheDocument();
    expect(screen.getByText('TURF')).toBeInTheDocument();
  });

  it('renders all social media links', () => {
    renderFooter();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('renders copyright text with current year', () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} TurfNow. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders Privacy Policy link', () => {
    renderFooter();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders Terms of Service link', () => {
    renderFooter();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders Contact Us link', () => {
    renderFooter();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });
});
