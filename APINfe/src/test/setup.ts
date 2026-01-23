import '@testing-library/jest-dom'

// Create a proper localStorage mock that actually stores values
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Reset localStorage content before each test, but keep the mock functions
beforeEach(() => {
  localStorageMock.clear();
  // Don't clear the mocks themselves, just reset the stored data
});