import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

const renderNotFound = () => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('NotFound (404) Page', () => {
  it('renders 404 heading', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders oops message', () => {
    renderNotFound();
    expect(screen.getByText(/out of bounds/i)).toBeInTheDocument();
  });

  it('renders Browse Turfs link', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /browse turfs/i })).toBeInTheDocument();
  });

  it('renders Go to Homepage link', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /go to homepage/i })).toBeInTheDocument();
  });

  it('Browse Turfs link points to /turf', () => {
    renderNotFound();
    const link = screen.getByRole('link', { name: /browse turfs/i });
    expect(link.getAttribute('href')).toBe('/turf');
  });

  it('Go to Homepage link points to /', () => {
    renderNotFound();
    const link = screen.getByRole('link', { name: /go to homepage/i });
    expect(link.getAttribute('href')).toBe('/');
  });
});
