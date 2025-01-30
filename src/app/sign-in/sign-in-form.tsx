"use client";

import { useActionState } from "react";

type SignInState = {
  error?: string;
};

export function SignInForm({
  signIn,
}: {
  signIn: (
    prevState: SignInState | undefined,
    formData: FormData
  ) => Promise<SignInState>;
}) {
  const [state, formAction] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state?.error && (
        <div className="text-red-500 text-sm text-center">{state.error}</div>
      )}
      <div>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          placeholder="Enter password"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-[#14162c] hover:bg-[#1d1f3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Login
        </button>
      </div>
    </form>
  );
}
