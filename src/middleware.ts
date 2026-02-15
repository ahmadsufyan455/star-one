import { auth } from "@/auth";

export default auth((req) => {
    const publicRoutes = ["/", "/login", "/about", "/privacy-policy", "/terms-of-service"];
    if (!req.auth && !publicRoutes.includes(req.nextUrl.pathname)) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
}
