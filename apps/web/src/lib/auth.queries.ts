import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ErrorCode, LoginDto, RegisterDto } from '@bookmark-manager/types';
import { api } from './axios';

interface AuthResponse {
   user: { id: string; email: string };
}

function extractErrorCode(err: unknown): string {
   if (isAxiosError(err)) {
      const msg = err.response?.data?.message;
      if (typeof msg === 'string') return msg;
   }
   return ErrorCode.INTERNAL_ERROR;
}

export const useLoginMutation = () =>
   useMutation({
      mutationFn: (dto: LoginDto) =>
         api
            .post<AuthResponse>('/auth/login', dto)
            .then((r) => r.data)
            .catch((err) => { throw new Error(extractErrorCode(err)); }),
   });

export const useRegisterMutation = () =>
   useMutation({
      mutationFn: (dto: RegisterDto) =>
         api
            .post<AuthResponse>('/auth/register', dto)
            .then((r) => r.data)
            .catch((err) => { throw new Error(extractErrorCode(err)); }),
   });
