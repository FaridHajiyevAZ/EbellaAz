import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
