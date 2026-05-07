import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/auth/auth.service'
import { useAuthStore } from '../store/auth.store'
import { loginSchema } from '../validations/auth.schema'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      setSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      })

      toast.success(response.message)

      const nextPath = location.state?.from?.pathname ?? '/dashboard'

      startTransition(() => {
        navigate(nextPath, { replace: true })
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'Unable to sign in')
    },
  })

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values)
  })

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
        Welcome Back
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
        Sign in to your workspace
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        Continue with your projects, deadlines, and team updates.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@taskflow.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={loginMutation.isPending}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        New to TaskFlow?{' '}
        <Link to="/signup" className="font-semibold text-cyan-300">
          Create an account
        </Link>
      </p>
    </div>
  )
}
