# HITCH — Rent A Car

A mobile car rental app built with React Native and Expo, backed by Supabase for
authentication and data. Browse available cars, book them for a date range, and
manage your bookings — all in a clean deep-black and gold interface.

## Features

- Email authentication (Supabase Auth)
- Browse available cars with pricing
- Create and manage bookings
- Animated splash / branding screen
- Deep black & gold themed UI

## Tech Stack

- **Frontend:** React Native + Expo (Expo Router, file-based routing)
- **Backend:** Supabase (Postgres database + auth)
- **Language:** TypeScript

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Open it on your phone with [Expo Go](https://expo.dev/go), or in an Android
   emulator / iOS simulator.

## Project Structure

```
app/         Screens and navigation (Expo Router)
components/   Reusable UI components
constants/    Theme and shared constants
context/      Auth context
hooks/        Custom hooks
lib/          Supabase client, analytics, notifications
assets/       Images and fonts
```

## Author

Ahzam
