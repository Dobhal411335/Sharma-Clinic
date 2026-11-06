import { auth, signOut } from "@/auth";

export default async function DoctorDashboardPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#102a43]">Doctor dashboard</h1>
      <p className="mt-2 text-sm text-[#5b6b7c]">
        Signed in as {session?.user?.email ?? "doctor"}
        {session?.user?.doctorId
          ? ` · doctor profile ${session.user.doctorId}`
          : ""}
        . Full doctor tools will land in a later task.
      </p>
      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-md border border-[#d9e5ea] bg-white px-4 py-2 text-sm font-medium text-[#102a43] hover:bg-[#f8fbfc]"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
