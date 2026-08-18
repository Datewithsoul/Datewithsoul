import Link from "next/link";
import { Heart } from "lucide-react";
import { loginWithLine } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const errorMsg = resolvedSearchParams.error;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <header className="bg-white py-4 px-8 shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#F44336] p-2 rounded-full text-white shadow-sm">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-wide text-[#5D4037]">Date With Soul</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-gray-100 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-center text-[#5D4037]">
            เข้าสู่ระบบ / สมัครสมาชิก
          </h1>

          <p className="text-center text-gray-600 mb-8">
            ดำเนินการต่ออย่างรวดเร็วด้วยบัญชี LINE ของคุณ
          </p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form action={loginWithLine}>
            <button 
              type="submit"
              className="w-full bg-[#00C300] text-white p-3.5 rounded-lg font-bold text-lg hover:bg-[#00b300] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.573-3.843 2.573-5.992zm-14.15-2.091h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm5.727 0h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm-2.862 0h1.378c.328 0 .592.264.592.592v2.559h1.345c.328 0 .592.264.592.592v.592c0 .328-.264.592-.592.592h-2.715c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm-5.727 0h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592z"/>
              </svg>
              ดำเนินการต่อด้วย LINE
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
