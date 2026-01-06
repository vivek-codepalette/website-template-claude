import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <Image
          src="https://www.yast.ai/yast-logo.png"
          alt="Yast logo"
          width={120}
          height={120}
          priority
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Your Website is getting ready...
          </h1>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating code...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
