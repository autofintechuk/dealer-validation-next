import { redirect } from "next/navigation";
import { validatePassword, setAuthCookie, isAuthenticated } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

async function signIn(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  "use server";

  const password = formData.get("password") as string;
  const isValid = await validatePassword(password);

  if (isValid) {
    await setAuthCookie();
    redirect("/");
  }

  return { error: "Invalid password" };
}

export default async function SignInPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8 bg-white border rounded-lg">
        <div className="space-y-2">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Dealer Validator
          </h1>
          <p className="text-center text-gray-600">
            Please enter the password to continue
          </p>
        </div>
        <SignInForm signIn={signIn} />
      </div>
    </div>
  );
}
