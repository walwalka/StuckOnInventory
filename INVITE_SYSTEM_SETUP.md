# Invite-Based Registration System Setup Guide

Your StuckOnInventory application has been successfully converted from open registration to an invite-only system. Here's what changed and how to use it.

## What Changed

### Database
- Added `role` column to users table (admin/user)
- Created `invites` table to track invitations
- Migration runs automatically on next server start

### Backend
- **New Routes**: `/api/invites` for managing invitations (admin only)
  - `POST /api/invites` - Create invitation
  - `GET /api/invites` - List all invitations
  - `DELETE /api/invites/:id` - Revoke invitation
  - `GET /api/invites/verify/:token` - Verify invite token (public)
- **Updated**: Registration endpoint now requires valid invite token
- **New**: Admin middleware to protect admin-only routes
- **New**: Email service for sending invitation emails

### Frontend
- **Updated**: `/invite/:token` route for accepting invitations
- **New**: Admin UI at `/admin/invites` for managing invitations
- **Removed**: Open registration - users must have invite link

## Setup Steps

### 1. Run the Database Migration

The migration will run automatically when you start the backend server. Just restart it:

```bash
cd inventoryBackend
npm start
```

Look for the message: `Invite system migration applied successfully`

### 2. Create Your First Admin User

Run the admin creation script:

```bash
cd database
node create-admin-user.js
```

Follow the prompts to create your admin account with:
- Email address
- Password (minimum 6 characters)

### 3. Log In as Admin

1. Navigate to `/login`
2. Enter your admin credentials
3. You'll now have access to the admin panel

### 4. Send Invitations

1. Go to Admin Panel (`/admin`)
2. Click "User Invitations"
3. Enter an email address and click "Send Invite"
4. The recipient will receive an email with an invite link
5. If SMTP is not configured, the invite link will be logged to the console

## How It Works

### For Admins

1. **Sending Invites**:
   - Navigate to `/admin/invites`
   - Enter recipient's email
   - System sends email with unique invite link
   - Invite expires in 7 days
   - Track invite status (pending/used/expired)

2. **Managing Invites**:
   - View all sent invitations
   - See who sent each invite
   - Revoke pending invitations
   - See which invites were used and by whom

### For New Users

1. Receive invitation email
2. Click invite link (`/invite/{token}`)
3. Email field is pre-filled and locked
4. Set password (minimum 6 characters)
5. Account is created with verified email
6. Redirect to login page
7. Log in and start using the app

## Email Configuration

Invite emails use the same SMTP settings as other system emails. Configure in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=StuckOnInventory <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
```

**Note**: If SMTP is not configured, invite links are logged to the console for development.

## Security Features

- Invite tokens are 32-byte random hex strings
- Invites expire after 7 days
- One-time use - can't reuse invite after registration
- Email verification automatic (trusted invite source)
- Admin-only access to invite management
- Rate limiting on all auth endpoints
- Users created via invite are automatically verified

## User Roles

### Admin
- Can send and manage invitations
- Access to admin panel
- Can manage all system data

### User
- Standard user account
- Created via invitation
- No invite management access

## API Endpoints

### Admin Only
```
POST   /api/invites              - Create invitation
GET    /api/invites              - List all invitations
DELETE /api/invites/:id          - Revoke invitation
```

### Public
```
GET    /api/invites/verify/:token - Verify invite token
POST   /api/auth/register         - Register with invite token (requires inviteToken)
POST   /api/auth/login            - Login
```

## Troubleshooting

### "Invalid invitation token"
- Invite may have expired (7 days)
- Invite may have already been used
- Token may be incorrect

### "Admin access required"
- User role is not 'admin'
- Run the create-admin-user script to create/promote admin

### Invite emails not sending
- Check SMTP configuration in `.env`
- Check console logs for invite links (development mode)
- Verify SMTP credentials are correct

### Can't access admin panel
- Ensure user has 'admin' role in database
- Use create-admin-user script to promote user

## Migrating Existing Users

If you have existing users who registered before the invite system:

1. They can still log in normally
2. Their role is 'user' by default
3. To make an existing user an admin:

```bash
cd database
node create-admin-user.js
# Enter existing user's email
# Choose to update role to admin
```

## Files Changed

### Backend
- `database/migrations/add-invite-system.sql` - Database schema
- `database/database.js` - Migration runner
- `inventoryBackend/middleware/auth.js` - Admin middleware
- `inventoryBackend/config/passport.js` - Include role in JWT
- `inventoryBackend/services/emailService.js` - Invite emails
- `inventoryBackend/routes/inviteRoute.js` - Invite management
- `inventoryBackend/routes/authRoute.js` - Updated registration
- `inventoryBackend/index.js` - Register invite routes

### Frontend
- `inventoryFrontend/src/components/Login/Register.jsx` - Invite acceptance
- `inventoryFrontend/src/components/Admin/InviteManagement.jsx` - Admin UI
- `inventoryFrontend/src/pages/Admin.jsx` - Added invite link
- `inventoryFrontend/src/App.jsx` - Updated routes

### Utilities
- `database/create-admin-user.js` - Admin creation script

## Next Steps

1. Create your admin account
2. Test the invite flow
3. Configure SMTP for email delivery
4. Send your first invitation
5. Review the admin panel features

Your application is now secure with invite-only registration!
