import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import RegisterPage from './page';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock('next-intl', () => ({
   useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

vi.mock('@/lib/axios', () => ({
   api: {
      post: vi.fn(),
      interceptors: {
         request: { use: vi.fn() },
         response: { use: vi.fn() },
      },
   },
}));

describe('RegisterPage', () => {
   it('renders name, email and password fields', () => {
      renderWithProviders(<RegisterPage />);
      expect(screen.getByRole('textbox', { name: /name/i })).toBeDefined();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeDefined();
   });
});
