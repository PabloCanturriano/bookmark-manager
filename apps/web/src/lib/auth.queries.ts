import { useMutation } from "@tanstack/react-query";
import { LoginDto, RegisterDto } from "@bookmark-manager/types";
import { api } from "./axios";

interface AuthResponse {
  user: { id: string; email: string };
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (dto: LoginDto) =>
      api.post<AuthResponse>("/auth/login", dto).then((r) => r.data),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (dto: RegisterDto) =>
      api.post<AuthResponse>("/auth/register", dto).then((r) => r.data),
  });
