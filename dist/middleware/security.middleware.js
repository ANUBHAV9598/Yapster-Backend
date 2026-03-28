const buildCsp = (clientOrigin) => {
    const connectSources = new Set([
        "'self'",
        clientOrigin,
        "ws:",
        "wss:",
        "http://localhost:5000",
        "ws://localhost:5000",
    ]);
    return [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self'",
        `connect-src ${Array.from(connectSources).join(" ")}`,
        "form-action 'self'",
        "upgrade-insecure-requests",
    ].join("; ");
};
export const securityHeaders = (clientOrigin) => {
    const contentSecurityPolicy = buildCsp(clientOrigin);
    const isProduction = process.env.NODE_ENV === "production";
    return (_req, res, next) => {
        res.setHeader("Content-Security-Policy", contentSecurityPolicy);
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        res.setHeader("X-DNS-Prefetch-Control", "off");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Origin-Agent-Cluster", "?1");
        res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        res.setHeader("X-XSS-Protection", "0");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
        if (isProduction) {
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }
        next();
    };
};
//# sourceMappingURL=security.middleware.js.map