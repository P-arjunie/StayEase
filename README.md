# StayEase

A React Native app built with Expo for student accommodation.

## Features

- User authentication (Login)
- Student registration with academic details
- Landlord registration with property verification
- Role-based registration (Student/Landlord)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npx expo start
   ```

3. Open the app:
   - On your phone: Install the Expo Go app and scan the QR code.
   - On emulator/simulator: Press the appropriate key (a for Android, i for iOS).

## Project Structure

- `App.js`: Main navigation setup
- `Login.js`: Login screen
- `RoleSelection.js`: Choose registration type
- `StudentRegistration.js`: Student registration form
- `LandlordRegistration.js`: Landlord registration form
- `app.json`: Expo configuration
- `package.json`: Dependencies and scripts

## Registration Fields

### Student Registration
- Full Name, Email, Mobile, Password, Confirm Password
- University Name, Faculty/Department (optional), Student ID (optional)
- Preferred Location, Budget Range, Accommodation Type
- Terms & Conditions acceptance

### Landlord Registration
- Full Name, Email, Mobile, Password, Confirm Password
- NIC/National ID, Address
- Property Ownership Proof (document upload), Property Location
- Terms & Conditions acceptance

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)