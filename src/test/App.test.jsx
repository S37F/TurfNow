import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import App from '../App';

// Mock the auth context
vi.mock('../context/Authcontext', () => ({
  UserAuthContextProvider: ({ children }) => children,
  useUserAuth: () => ({
    user: null,
    loading: false,
    isAdmin: false,
    isOwner: false,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    googleSignin: vi.fn(),
    refreshClaims: vi.fn(),
  }),
}));

// Mock firebase config
vi.mock('../firebase-config/config', () => ({
  auth: { currentUser: null },
  db: {},
  database: {},
}));

const renderApp = (initialRoute = '/') => {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    // App wraps everything in ErrorBoundary > AllRoutes
    // Just verify it doesn't throw
    expect(() => renderApp()).not.toThrow();
  });

  it('renders the app container', () => {
    const { container } = renderApp();
    expect(container.firstChild).toBeTruthy();
  });
});
