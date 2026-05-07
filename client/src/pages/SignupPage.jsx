import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/auth/auth.service'
import { useAuthStore } from '../store/auth.store'
import { signupSchema } from '../validations/auth.schema'

export default function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (response) => {
      setSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      })

      toast.success(response.message)

      startTransition(() => {
        navigate('/dashboard', { replace: true })
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'Unable to create account')
    },
  })

  const onSubmit = handleSubmit((values) => {
    signupMutation.mutate(values)
  })

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
        Get Started
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
        Create your TaskFlow account
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        Set up your team workspace and start managing projects with a cleaner flow.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="Harsh Kumar"
          error={errors.name?.message}
          {...register('name')}
        />

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
          placeholder="Create a strong password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={signupMutation.isPending}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyan-300">
          Sign in
        </Link>
      </p>
    </div>
  )
}
