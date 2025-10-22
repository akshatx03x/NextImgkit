# Fix Register API 500 Error

- [x] Remove pre-save hook from models/User.ts
- [x] Update app/api/auth/register/route.ts to hash password manually and add detailed logging
- [ ] Ensure MONGO_URI is set in .env file
- [ ] Test registration functionality
