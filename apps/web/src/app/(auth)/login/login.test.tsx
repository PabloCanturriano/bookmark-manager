import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import LoginPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Mock next-intl
vi.mock('next-intl', () => ({
   useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

// Mock axios to avoid real HTTP calls
vi.mock('@/lib/axios', () => ({
   api: {
      post: vi.fn(),
      interceptors: {
         request: { use: vi.fn() },
         response: { use: vi.fn() },
      },
   },
}));

describe('LoginPage', () => {
   beforeEach(() => vi.clearAllMocks());

   it('renders email and password fields', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('textbox', { name: /email/i })).toBeDefined();
   });

   it('shows validation error for invalid email', async () => {
      renderWithProviders(<LoginPage />);
      const submit = screen.getByRole('button', { name: /submit/i });

      await userEvent.click(submit);

      await waitFor(() => {
         expect(screen.getByText(/auth.login.emailLabel/)).toBeDefined();
      });
   });
});
