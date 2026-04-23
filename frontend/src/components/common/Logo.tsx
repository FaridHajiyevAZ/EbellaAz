import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 font-display text-xl tracking-tight text-fg', className)}>
      <span className="font-semibold">Ebella</span>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
    </span>
  );
}
