import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { SigninPayload, SignupPayload, User } from "@/types"

type AuthResponse = {
  token: string
  user: User
}


// đăng nhập
export function useSignin() {

  return useMutation({
    mutationFn: async (data: SigninPayload) => {

      const res = await apiClient<AuthResponse>(
        "/users/signin",
        {
          method: "POST",
          body: data
        }
      )

      localStorage.setItem("token", res.token)

      return res
    }
  })
}


// đăng ký
export function useSignup() {

  return useMutation({
    mutationFn: async (data: SignupPayload) => {

      const res = await apiClient<AuthResponse>(
        "/users/signup",
        {
          method: "POST",
          body: data
        }
      )

      return res
    }
  })
}