
import { AuthForm } from "@/components/auth-form";
import { Icons } from "@/components/icons";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-muted">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Icons.logo className="h-12 w-12 mx-auto" />
          <h1 className="text-3xl font-bold font-headline">Pluto Brew</h1>
          <p className="text-balance text-muted-foreground">
            Login or create an account to start your journey
          </p>
        </div>
        <AuthForm />
        <div className="mt-4 text-center text-sm">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
