import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-[Instrument Sans]">
                <div className="w-full max-w-md text-center space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                            className="w-10 h-10"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3L2 9l10 6 10-6-10-6zm0 6v12"
                            />
                        </svg>
                        <h1 className="text-2xl font-semibold">
                            Welcome to Your App
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Please log in or register to continue
                        </p>
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                        {auth.user ? (
                            <Link
                                href={dashboard().url}
                                className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login().url}
                                    className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register().url}
                                        className="px-6 py-2.5 rounded-lg border border-gray-600 text-white font-medium hover:bg-gray-900 transition"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <footer className="pt-10 text-sm text-gray-600">
                        © {new Date().getFullYear()} — Minimal Laravel + React
                    </footer>
                </div>
            </div>
        </>
    );
}
