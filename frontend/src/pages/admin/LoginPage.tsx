import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { AppApiError } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import { RedirectIfAuthed } from '@/routes/guards';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password is too short'),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  return (
    <RedirectIfAuthed>
      <LoginForm />
    </RedirectIfAuthed>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof AppApiError ? err.message : 'Unable to sign in';
      setError('password', { message: msg });
      toast.error(msg);
    }
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardSubtitle>Use your admin credentials.</CardSubtitle>
      </CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="admin@ebella.az"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>
          <Field label="Password" required error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting || login.isPending}>
            Sign in
          </Button>
          <p className="text-center text-xs text-muted">
            <Link to="/" className="hover:text-fg">← Back to website</Link>
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
