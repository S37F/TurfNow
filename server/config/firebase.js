import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '.env') });

// Helper function to parse private key from various formats
const parsePrivateKey = (key) => {
  if (!key || key === 'your_private_key_here' || key.includes('YOUR_PRIVATE_KEY_HERE')) {
    return null;
  }
  
  // If it's already properly formatted with real newlines
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('\n')) {
    return key;
  }
  
  // Replace escaped newlines (\\n or \n as string)
  let parsed = key.replace(/\\n/g, '\n');
  
  return parsed;
};

// Track if Firebase is properly initialized
let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK (env-only; JSON key files are disallowed)
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (privateKey) {
      console.log('🔑 Using environment variables for Firebase');

      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      });
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized with env vars');
    } else {
      throw new Error('Invalid or missing FIREBASE_PRIVATE_KEY');
    }
  } else {
    throw new Error('No Firebase credentials configured (env vars required)');
  }
} catch (error) {
  console.warn('');
  console.warn('⚠️  Firebase Admin SDK not initialized:', error.message);
  console.warn('');

  // In production, Firebase MUST be configured — crash with a clear error
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: Firebase is required in production. Exiting.');
    process.exit(1);
  }

  console.warn('   The server will run but Firebase features (auth, database) will be mocked.');
  console.warn('');
  console.warn('   To enable Firebase, set these in server/.env:');
  console.warn('   - FIREBASE_PROJECT_ID');
  console.warn('   - FIREBASE_CLIENT_EMAIL');
  console.warn('   - FIREBASE_PRIVATE_KEY (with proper \\n escaping)');
  console.warn('   - FIREBASE_DATABASE_URL');
  console.warn('');
}

// Create mock/stub functions for when Firebase isn't initialized
const createMockDb = () => {
  // Chainable query builder that returns itself for method chaining
  const createQueryBuilder = () => {
    const builder = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      startAfter: () => builder,
      endBefore: () => builder,
      get: async () => ({ docs: [], empty: true, size: 0 }),
      doc: (id) => ({
        get: async () => ({ exists: false, id, data: () => null }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
        collection: () => createQueryBuilder(),
      }),
      add: async (data) => ({ id: 'mock-id-' + Date.now() }),
    };
    return builder;
  };
  
  return {
    collection: (name) => createQueryBuilder(),
  };
};

const createMockRealtimeDb = () => {
  const createRefBuilder = (path = '/') => {
    const builder = {
      get: async () => ({ exists: () => false, val: () => null }),
      set: async () => {},
      update: async () => {},
      remove: async () => {},
      push: () => ({ 
        key: 'mock-key-' + Date.now(), 
        set: async () => {},
        ...createRefBuilder(path + '/mock-key')
      }),
      child: (childPath) => createRefBuilder(path + '/' + childPath),
      once: async () => ({ exists: () => false, val: () => null }),
      orderByChild: () => builder,
      equalTo: () => builder,
      limitToFirst: () => builder,
      limitToLast: () => builder,
    };
    return builder;
  };
  
  return {
    ref: (path) => createRefBuilder(path || '/'),
  };
};

const createMockAuth = () => ({
  verifyIdToken: async (token) => ({ 
    uid: 'mock-uid', 
    email: 'mock@example.com',
    email_verified: true 
  }),
  getUser: async (uid) => ({ 
    uid: uid || 'mock-uid', 
    email: 'mock@example.com',
    customClaims: {} 
  }),
  createUser: async (data) => ({ uid: 'mock-uid-' + Date.now(), ...data }),
  updateUser: async (uid, data) => ({ uid, ...data }),
  deleteUser: async () => {},
  setCustomUserClaims: async () => {},
});

// Export Firebase services (real or mock based on initialization status)
export const db = isFirebaseInitialized ? admin.firestore() : createMockDb();
export const realtimeDb = isFirebaseInitialized ? admin.database() : createMockRealtimeDb();
export const auth = isFirebaseInitialized ? admin.auth() : createMockAuth();
export { isFirebaseInitialized };

export default admin;
