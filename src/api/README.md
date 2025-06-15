# API Services Layer

This directory contains a structured API layer for the SOL Trading Mini App. The API layer is built using axios and provides a clean interface for making HTTP requests to the backend API.

## Directory Structure

```
api/
├── apiClient.ts          # Base axios instance with common configuration
├── createService.ts      # Helper to create API services with less boilerplate
├── index.ts              # Exports all services and types
├── services/
│   ├── walletService.ts  # Wallet-related API calls
│   ├── userService.ts    # User-related API calls
│   └── tradingService.ts # Trading-related API calls
├── hooks/
│   └── useApi.ts         # React hook for using the API with TMA init data
```

## Usage

### Using the API in React Components

The recommended way to use the API in React components is with the `useApi` hook:

```typescript
import { useApi } from '@/api';

function MyComponent() {
  // This hook automatically handles setting the Telegram Mini App init data
  const api = useApi();
  
  useEffect(() => {
    const fetchData = async () => {
      // Use any service from the api object
      const walletData = await api.wallet.getWalletData();
      const markets = await api.trading.getMarkets();
      // ...
    };
    
    fetchData();
  }, [api]);
  
  // ...
}
```

### Importing Individual Services

You can also import individual services:

```typescript
import { walletService, userService, tradingService } from '@/api';

// Or import the entire API object
import api from '@/api';
```

If you use individual services directly, you'll need to manually set the init data:

```typescript
import { walletService, setInitData } from '@/api';
import { initDataRaw, useSignal } from '@telegram-apps/sdk-react';

function MyComponent() {
  const initData = useSignal(initDataRaw);
  
  useEffect(() => {
    // Set the init data for API calls
    setInitData(initData);
    
    // Now you can use the services
    walletService.getWalletData().then(data => {
      console.log(data);
    });
  }, [initData]);
}
```

### Examples

Using wallet service:

```typescript
// Get wallet data
const walletData = await api.wallet.getWalletData();
console.log(walletData.address, walletData.balance);
```

Using trading service:

```typescript
// Get market data
const markets = await api.trading.getMarkets();

// Place an order
const order = await api.trading.placeOrder({
  symbol: 'SOL/USDT',
  side: 'buy',
  type: 'market',
  quantity: 1
});
```

## Creating New Services

### Using createApiService Helper

You can use the `createApiService` helper to quickly create new services with common CRUD operations:

```typescript
import { createApiService } from '@/api';

// Define your entity types
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CreateProductParams {
  name: string;
  price: number;
}

// Create a base service with CRUD operations
const baseService = createApiService<Product, CreateProductParams>('/products');

// Create a service class with additional custom methods
class ProductService {
  // Include all base CRUD methods
  getAll = baseService.getAll;
  getById = baseService.getById;
  create = baseService.create;
  update = baseService.update;
  delete = baseService.delete;
  
  // Add custom methods
  async getDiscounted(): Promise<Product[]> {
    return baseService.get<Product[]>('/discounted');
  }
}

export const productService = new ProductService();
export default productService;
```

### Manual Service Creation

For more complex services, you can create them manually:

```typescript
import apiClient from '../apiClient';

export interface MyEntity {
  // ...
}

class MyService {
  async getData(): Promise<MyEntity[]> {
    const { data } = await apiClient.get<MyEntity[]>('/my-endpoint');
    return data;
  }
  
  // Add more methods as needed
}

export const myService = new MyService();
export default myService;
```

## Authentication

Authentication with the Telegram Mini App init data is handled automatically when using the `useApi` hook. The hook sets up the init data when the component mounts and keeps it updated if it changes.

## Error Handling

API errors are logged to the console by default. You can implement custom error handling by wrapping service calls in try/catch blocks:

```typescript
try {
  const data = await api.wallet.getWalletData();
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to get wallet data:', error);
}
```

## Adding New Services

To add a new service:

1. Create a new file in the `services` directory
2. Export interfaces for request/response data
3. Create a class with methods for each API endpoint
4. Export an instance of the class
5. Add the service to `api/index.ts` 