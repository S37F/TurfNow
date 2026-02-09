import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ProtectedRoute } from '../components/ProtectedRoute';

vi.mock('../firebase-config/config', () => ({
  auth: { currentUser: null },
  db: {},
  database: {},
}));

const renderProtectedRoute = (mockAuth) => {
  vi.doMock('../context/Authcontext', () => ({
    useUserAuth: () => mockAuth,
  }));

  // We need a fresh import of ProtectedRoute to use the new mock
  // Instead, pass values as props indirectly through context mock
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
};

// Since ProtectedRoute uses useUserAuth directly, we need a top-level mock
// and override it per test
const mockUseUserAuth = vi.fn();

vi.mock('../context/Authcontext', () => ({
  useUserAuth: () => mockUseUserAuth(),
}));

const renderWithAuth = (authState) => {
  mockUseUserAuth.mockReturnValue(authState);

  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('ProtectedRoute', () => {
  it('shows loading spinner when loading', () => {
    renderWithAuth({ user: null, loading: true });
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
  });

  it('redirects to /login when user is null and not loading', () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    renderWithAuth({ user: { uid: 'test-uid', email: 'test@example.com' }, loading: false });
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
