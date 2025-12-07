import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthRepositoryApi } from "@/data/repositories/auth/AuthRepositoryApi";
import type { UserEntity } from "@/domain/entities/user/UserEntity";

const authRepo = new AuthRepositoryApi();

export const useAuthHook = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<UserEntity | null>({
    queryKey: ["currentUser"],
    queryFn: () => authRepo.checkUser(),
    staleTime: 1000 * 60, 
  });

  const loginMutation = useMutation<UserEntity, Error, { identifier: string; password: string }>({
    mutationFn: ({ identifier, password }) => authRepo.login(identifier, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data);
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: () => authRepo.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
};
