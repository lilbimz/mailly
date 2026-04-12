# GET /api/email/[id]/messages

Fetches all messages for a temporary email address.

## Endpoint

```
GET /api/email/[id]/messages
```

## Parameters

### Path Parameters

- `id` (string, required): The temporary email ID

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg123",
        "from": "sender@example.com",
        "subject": "Welcome!",
        "receivedAt": "2024-01-01T12:00:00Z",
        "preview": "Thank you for signing up..."
      }
    ]
  }
}
```

**Note**: Messages are sorted by `receivedAt` in descending order (newest first).

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
    "message": "Email address not found. It may have expired."
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

**Headers**:
- `Retry-After`: Seconds until rate limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: ISO timestamp when rate limit resets

#### 500 Internal Server Error - API Error

```json
{
  "success": false,
  "error": {
    "code": "API_ERROR",
    "message": "Failed to fetch messages. Please try again."
  }
}
```

## Rate Limiting

- **Limit**: 60 requests per minute per IP address
- **Window**: 60 seconds (1 minute)
- **Identifier**: Client IP address + endpoint

## Validation

### Email ID Format

- Must be alphanumeric (a-z, A-Z, 0-9)
- Length: 1-100 characters
- No special characters allowed

## Implementation Details

### Message Sorting

Messages are automatically sorted by `receivedAt` timestamp in descending order (newest messages first).

### Error Handling

1. **Network Errors**: 10-second timeout on Boomlify API requests
2. **Invalid Email ID**: Validated before API call
3. **Rate Limiting**: Checked before processing request
4. **API Errors**: Mapped to user-friendly error messages

### Security

- API key stored in environment variables (never exposed to client)
- Input validation on all parameters
- Rate limiting to prevent abuse
- Sanitized response data

## Example Usage

### Fetch Messages

```typescript
const response = await fetch('/api/email/abc123/messages');
const data = await response.json();

if (data.success) {
  console.log('Messages:', data.data.messages);
} else {
  console.error('Error:', data.error.message);
}
```

### Handle Rate Limiting

```typescript
const response = await fetch('/api/email/abc123/messages');

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

## Requirements Satisfied

- **R3**: Display inbox messages with sender, subject, and timestamp
- **R5**: Auto-refresh inbox (polling endpoint every 15 seconds)
- **R12**: API security with rate limiting and validation
