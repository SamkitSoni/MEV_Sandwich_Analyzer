import { NextResponse } from "next/server";

interface MiddlewareRequest {
    cookies: {
        get: (name: string) => string | undefined;
    };
    nextUrl: {
        pathname: string;
    };
    url: string;
}

export function middleware(req: MiddlewareRequest) {
    const walletAddress = req.cookies.get("walletAddress");

    if (!walletAddress && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}