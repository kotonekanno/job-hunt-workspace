import { AuthForm } from "@/features/auth/ui/AuthForm";

export function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] w-full items-center justify-center px-5 py-10 sm:px-8">
      <AuthForm mode="register" />
    </div>
  );
}
