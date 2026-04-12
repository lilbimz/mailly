# DELETE /api/email/[id]

Deletes a temporary email address from the Boomlify Temp Mail API.

## Endpoint

```
DELETE /api/email/[id]
```

## Parameters

### Path Parameters

- `id` (string, required): The unique identifier of the temporary email to delete

## Rate Limiting

- **Limit**: 20 requests per minute per IP address
- **Response**: 429 Too Many Requests when exceeded
- **Headers**: 
  - `Retry-After`: Seconds until rate limit resets
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: ISO timestamp when rate limit resets

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Email deleted successfully"
}
```

### Error Responses

#### 400 Bad Request - Invalid Email ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL_ID",
    "message": "Invalid email ID format"
  }
}
```

#### 404 Not Found - Email Not Found

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email address not found. It may have already expired."
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

#### 500 Internal Server Error - API Error

```json
{
  "success": false,
  "error": {
    "code": "API_ERROR",
    "message": "Failed to delete email. Please try again."
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

## Example Usage

### Using fetch

```typescript
const emailId = 'abc123xyz';

const response = await fetch(`/api/email/${emailId}`, {
  method: 'DELETE',
});

const data = await response.json();

if (data.success) {
  console.log('Email deleted successfully');
} else {
  console.error('Error:', data.error.message);
}
```

### Using axios

```typescript
import axios from 'axios';

try {
  const response = await axios.delete(`/api/email/${emailId}`);
  console.log('Email deleted successfully');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Error:', error.response?.data.error.message);
  }
}
```

## Implementation Details

### Validation

- Email ID must be alphanumeric
- Email ID must be between 1 and 100 characters
- Email ID format is validated using `isValidEmailId()` utility

### Security

- API key stored in environment variables (never exposed to client)
- Rate limiting prevents abuse (20 requests/minute per IP)
- Input sanitization on all parameters
- Proper error handling without exposing internal details

### Error Handling

- **Network Errors**: Timeout after 10 seconds, returns NETWORK_ERROR
- **API Errors**: Logs server-side, returns user-friendly messages
- **404 Errors**: Specifically handled for non-existent emails
- **Rate Limiting**: Returns 429 with retry information

## Requirements Satisfied

- **R6**: Delete Temporary Email
  - Validates email ID format
  - Calls Boomlify API to delete email
  - Returns success confirmation
  - Removes email from display (handled client-side)
  - Displays error messages on failure

- **R12**: API Security and Rate Limiting
  - API key stored in environment variables
  - Validates all incoming requests
  - Implements rate limiting (20 requests/minute)
  - Sanitizes user inputs
  - Returns appropriate HTTP status codes

## Testing

See `__tests__/route.test.ts` for integration tests covering:
- Successful email deletion
- Invalid email ID validation
- 404 error for non-existent email
- Rate limit enforcement
- Network error handling
