import { auth } from "@/auth";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const publicRoutes = ["/", "/login", "/about", "/privacy-policy", "/terms-of-service"];
    // Public read-only share pages live under /r/[id] and must be reachable
    // without authentication so links shared on Twitter/Reddit/etc. work.
    const isPublic = publicRoutes.includes(pathname) || pathname.startsWith("/r/");

    if (!req.auth && !isPublic) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
}
