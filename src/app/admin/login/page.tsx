import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Author Sign In — DaalBaatiChurma',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium text-ink">
            DaalBaatiChurma
          </h1>
          <p className="mt-2 font-body text-base text-slate">Author sign-in</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
