# AETCH Manual QA Checklist

## Authentication

- [ ] Register with valid email and password
- [ ] Register with duplicate email shows error
- [ ] Register with weak password shows validation error
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Session persists after page refresh
- [ ] Logout clears session and redirects
- [ ] Protected routes redirect to login when unauthenticated
- [ ] OAuth login flow completes successfully
- [ ] Password reset email sends and link works

## Gallery

- [ ] Gallery loads initial batch of tattoos
- [ ] Infinite scroll loads more on scroll down
- [ ] Filter by tattoo style returns correct results
- [ ] Filter by color palette works
- [ ] Filter by placement works
- [ ] Multiple filters combine correctly
- [ ] Sort by popularity returns ordered results
- [ ] Sort by newest returns ordered results
- [ ] Trending tattoos section displays
- [ ] Tattoo detail page loads with full info
- [ ] Save tattoo adds to user collection
- [ ] Share tattoo generates shareable link

## Artist Profiles

- [ ] Artist profile page loads with bio
- [ ] Portfolio gallery displays tattoo work
- [ ] Social links are clickable and correct
- [ ] Availability calendar renders
- [ ] Tattoo style tags display
- [ ] Ratings and review score visible
- [ ] Individual reviews render with content
- [ ] Follow artist updates follower count
- [ ] Unfollow artist updates follower count
- [ ] Location map renders correctly
- [ ] Pricing estimates section visible

## Shop Profiles

- [ ] Shop detail page loads
- [ ] Artist list displays all shop artists
- [ ] Shop gallery renders images
- [ ] Shop reviews display
- [ ] Contact form submits successfully
- [ ] Shop location map renders
- [ ] Shop booking entry point works

## Bookings

- [ ] Create booking request with date and details
- [ ] Booking confirmation email/notification sent
- [ ] Artist sees pending booking request
- [ ] Artist confirms booking updates status
- [ ] Artist declines booking updates status
- [ ] User sees booking status change
- [ ] Booking timeline displays all status changes
- [ ] Cannot double-book same time slot
- [ ] Cancel booking updates status correctly

## Social Feed

- [ ] Create text post successfully
- [ ] Create post with image upload
- [ ] Like a post increments count
- [ ] Unlike a post decrements count
- [ ] Add comment to post
- [ ] Delete own comment
- [ ] Follow feed shows posts from followed users
- [ ] Trending feed shows popular posts
- [ ] Tag artist in post
- [ ] Tag tattoo style in post
- [ ] Repost shares to own feed

## Messaging

- [ ] Create new conversation with user
- [ ] Send message appears in thread
- [ ] Receive message appears in thread
- [ ] Unread indicator shows on new message
- [ ] Unread indicator clears on opening conversation
- [ ] Conversation list sorts by most recent
- [ ] Empty conversation state displays properly

## User Settings

- [ ] Update display name saves
- [ ] Update bio saves
- [ ] Change avatar uploads and displays
- [ ] Update username validates uniqueness
- [ ] Update username saves and reflects globally
- [ ] Email change triggers verification
- [ ] Delete account prompts confirmation

## Notifications

- [ ] Notification received on new follower
- [ ] Notification received on post like
- [ ] Notification received on comment
- [ ] Notification received on booking update
- [ ] Notification dropdown displays list
- [ ] Mark single notification as read
- [ ] Mark all notifications as read
- [ ] Unread count badge updates correctly

## Search

- [ ] Search tattoos by keyword returns results
- [ ] Search artists by name returns results
- [ ] Search shops by location returns results
- [ ] Empty search shows appropriate state
- [ ] Filter combinations narrow results correctly
- [ ] Search results paginate or infinite scroll
- [ ] Search is responsive under 500ms

## Reports

- [ ] Submit report on post with reason
- [ ] Submit report on user with reason
- [ ] Duplicate report on same item shows error
- [ ] Report confirmation feedback displays
- [ ] Report form validates required fields

## Admin

- [ ] Admin dashboard loads for admin users
- [ ] Non-admin users cannot access admin routes
- [ ] View user list with search
- [ ] Ban/unban user updates status
- [ ] Remove reported post
- [ ] Remove reported tattoo
- [ ] View report queue

## Responsive Design

- [ ] Mobile nav hamburger menu opens and closes
- [ ] Gallery grid adjusts on mobile
- [ ] Gallery grid adjusts on tablet
- [ ] Artist profile readable on mobile
- [ ] Booking form usable on mobile
- [ ] Images scale without overflow
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets are minimum 44px

## Performance

- [ ] Initial page load under 3 seconds
- [ ] Gallery images lazy load on scroll
- [ ] No visible layout shift on load
- [ ] Route transitions feel instant
- [ ] Large image uploads show progress
- [ ] API responses return under 1 second

## Security

- [ ] Rate limited endpoint returns 429 after threshold
- [ ] Unauthenticated API calls return 401
- [ ] Invalid input returns validation error not stack trace
- [ ] File upload rejects non-image files
- [ ] XSS payload in input is sanitized
- [ ] CSRF token present on forms
- [ ] SQL injection attempts fail safely
