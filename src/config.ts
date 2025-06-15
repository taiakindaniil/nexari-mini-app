// import 'dotenv/config';

export const IS_PROD = true;

export const API_BASE_URL = IS_PROD ? "https://upright-mighty-colt.ngrok-free.app" : "https://upright-mighty-colt.ngrok-free.app"; // process.env.API_BASE_URL; 

export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  DEVELOPMENT: import.meta.env.DEV || false,
  MOCK_MODE: import.meta.env.VITE_MOCK_MODE === 'true' || false,
};

// Mock user data for development
export const mockUser = {
  id: 123456789,
  nickname: 'TestUser',
  avatar: 'https://placehold.co/40x40',
  fullName: 'Test User',
};

// Mock init data for development
export const mockInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%7D&chat_instance=-1234567890&chat_type=private&auth_date=1703123400&hash=abc123';
