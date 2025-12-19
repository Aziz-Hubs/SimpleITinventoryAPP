# Environment Configuration Guide

To configure the application for ASP.NET backend integration, create a `.env.local` file in the root directory with the following variables:

```bash
# API Configuration for ASP.NET Backend

# Base URL for the ASP.NET backend API
# Development: http://localhost:5000
# Production: https://api.yourdomain.com
NEXT_PUBLIC_API_URL=http://localhost:5000

# Toggle between mock data and real API calls
# Set to 'true' for development with mock data, 'false' to use real API
NEXT_PUBLIC_USE_MOCK_DATA=true

# API request timeout in milliseconds
NEXT_PUBLIC_API_TIMEOUT=30000

# Enable detailed API logging in console (development only)
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

## Configuration Options

### NEXT_PUBLIC_API_URL

The base URL of your ASP.NET backend API. This should include the protocol and domain but NOT the `/api` path.

- **Development**: `http://localhost:5000` or `https://localhost:5001`
- **Production**: `https://api.yourdomain.com`

### NEXT_PUBLIC_USE_MOCK_DATA

Controls whether the application uses mock data or makes real API calls.

- **`true`**: Use mock data from `inv.json` and hardcoded mock data
- **`false`**: Make real HTTP requests to the ASP.NET backend

### NEXT_PUBLIC_API_TIMEOUT

Request timeout in milliseconds. Default is 30000 (30 seconds).

### NEXT_PUBLIC_ENABLE_API_LOGGING

Enable detailed console logging for API requests and responses. Useful for debugging.

- **`true`**: Log all API calls to console
- **`false`**: Disable API logging

## Quick Start

1. Copy the configuration above to a new file `.env.local`
2. Update `NEXT_PUBLIC_API_URL` with your ASP.NET API URL
3. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` when your backend is ready
4. Restart the development server: `npm run dev`
