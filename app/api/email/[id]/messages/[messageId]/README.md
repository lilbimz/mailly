# GET /api/email/[id]/messages/[messageId]

Fetches the full content of a specific message from a temporary email inbox.

## Endpoint

```
GET /api/email/[id]/messages/[messageId]
```

## Parameters

- `id` (path parameter): The temporary email ID
- `messageId` (path parameter): The unique message identifier

## Rate Limiting

- **Limit**: 60 requests per minute per IP address
- **Response**: 429 Too Many Requests when exceeded

## Success Response

**Status Code**: 200 OK

```json
{
  "success": true,
  "data": {
    "id": "msg123",
    "from": "sender@example.com",
    "subject": "Welcome to our service",
    "receivedAt": "2024-01-15T10:30:00Z",
    "body": "Full message body content...",
    "isHtml": true
  }
}
```

## Error Responses

### 400 Bad Request - Invalid Email ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL_ID",
    "message": "Invalid email ID format"
  }
}
```

### 400 Bad Request - Invalid Message ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL_ID",
    "message": "Invalid message ID format"
  }
}
```

### 404 Not Found - Message Not Found

```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_NOT_FOUND",
    "message": "Message not found"
  }
}
```

### 429 Too Many Requests - Rate Limit Exceeded

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
- `X-RateLimit-Reset`: ISO timestamp when limit resets

### 500 Internal Server Error - API Error

```json
{
  "success": false,
  "error": {
    "code": "API_ERROR",
    "message": "Failed to fetch message. Please try again."
  }
}
```

### 500 Internal Server Error - Network Timeout

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Request timeout. Please try again."
  }
}
```

## Implementation Details

### Validation
- Email ID must be alphanumeric, 1-100 characters
- Message ID must be alphanumeric, 1-100 characters
- Both IDs are validated before making external API calls

### Security
- API key stored in environment variables (never exposed to client)
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- 10-second timeout on external API calls

### HTML Content
- HTML content is returned as-is from the API
- **Client-side sanitization required**: Use DOMPurify before rendering HTML content
- The `isHtml` flag indicates whether the body contains HTML

### Error Handling
- Network timeouts return 500 with NETWORK_ERROR code
- Boomlify API errors are logged server-side
- User-friendly error messages returned to client
- Appropriate HTTP status codes for different error types

## Example Usage

### JavaScript/TypeScript

```typescript
async function fetchMessage(emailId: string, messageId: string) {
  try {
    const response = await fetch(`/api/email/${emailId}/messages/${messageId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to fetch message:', error);
    throw error;
  }
}

// Usage
const message = await fetchMessage('abc123', 'msg456');
console.log('Message body:', message.body);
```

### cURL

```bash
curl -X GET http://localhost:3000/api/email/abc123/messages/msg456
```

## Related Endpoints

- `GET /api/email/[id]/messages` - List all messages for an email
- `POST /api/email/create` - Create a new temporary email
- `DELETE /api/email/[id]` - Delete a temporary email

## Requirements Satisfied

- **R4**: Read Full Email Messages - Fetches complete message content including body
- **R12**: API Security and Rate Limiting - Secure proxy with rate limiting and validation
