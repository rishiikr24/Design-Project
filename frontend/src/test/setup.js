import '@testing-library/jest-dom';

// In automated test runs, force mock mode so tests never depend on an external network or live Supabase project
process.env.VITE_USE_MOCKS = 'true';
