# POST /api/email/create

Creates a new temporary email address with a specified duration.

## Endpoint

```
POST /api/email/create
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "duration": "10min" | "1hr" | "1day"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| duration | string | Yes | Duration for email validity. Must be one of: `10min`, `1hr`, `1day` |

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "email": "temp123@boomlify.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-01-15T11:30:00.000Z",
    "duration": "1hr"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Duration
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DURATION",
    "message": "Invalid duration. Must be one of: 10min, 1hr, 1day"
  }
}
```

#### 429 Too Many Requests - Rate Limit Exceeded
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**Headers:**
- `Retry-After`: Number of seconds until rate limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when rate limit resets

#### 500 Internal Server Error - API Error
```json
{
  "success": false,
  "error": {
    "code": "API_ERROR",
    "message": "Failed to create temporary email. Please try again."
  }
}
```

#### 500 Internal Server Error - Network Error
```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Request timeout. Please try again."
  }
}
```

## Rate Limiting

- **Limit**: 10 requests per minute per IP address
- **Window**: 60 seconds (1 minute)
- **Identification**: Based on `X-Forwarded-For` or `X-Real-IP` headers, fallback to connection IP

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/api/email/create \
  -H "Content-Type: application/json" \
  -d '{"duration": "1hr"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('/api/email/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ duration: '1hr' }),
});

const data = await response.json();

if (data.success) {
  console.log('Email created:', data.data.email);
  console.log('Expires at:', data.data.expiresAt);
} else {
  console.error('Error:', data.error.message);
}
```

### TypeScript

```typescript
import { Duration } from '@/types';

interface CreateEmailRequest {
  duration: Duration;
}

interface CreateEmailResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    createdAt: string;
    expiresAt: string;
    duration: Duration;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function createEmail(duration: Duration): Promise<CreateEmailResponse> {
  const response = await fetch('/api/email/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ duration }),
  });

  return response.json();
}

// Usage
const result = await createEmail('1hr');
if (result.success) {
  console.log('Email:', result.data.email);
}
```

## Implementation Details

### Security
- API key stored in environment variable (`BOOMLIFY_API_KEY`)
- API key never exposed to client
- All requests validated before forwarding to Boomlify API
- Input sanitization for duration parameter

### External API Integration
- **Provider**: Boomlify Temp Mail API
- **Endpoint**: `https://v1.boomlify.com/api/v1/emails/create`
- **Timeout**: 10 seconds
- **Method**: POST

### Error Handling
- Network timeouts handled gracefully
- Boomlify API errors mapped to user-friendly messages
- All errors logged server-side for monitoring
- Appropriate HTTP status codes returned

### Expiration Calculation
- Expiration timestamp calculated server-side
- Based on creation time + duration
- Duration mappings:
  - `10min`: 10 minutes (600,000 ms)
  - `1hr`: 1 hour (3,600,000 ms)
  - `1day`: 24 hours (86,400,000 ms)

## Testing

Run the integration tests:

```bash
npm test app/api/email/create/__tests__/route.test.ts
```

## Requirements Satisfied

- **R1.2**: Email creation with duration selection
- **R1.3**: Display temporary email address to user
- **R1.4**: API proxy protects Boomlify API key
- **R12**: API security and rate limiting
  - R12.1: API key in environment variables
  - R12.2: Request validation
  - R12.3: Rate limiting (10 requests/minute)
  - R12.4: Input sanitization
  - R12.5: Appropriate HTTP status codes
