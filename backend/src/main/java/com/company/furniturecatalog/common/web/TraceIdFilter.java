package com.company.furniturecatalog.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Puts a stable trace id on every log line and on the response.
 *
 * - Reuses an inbound {@code X-Trace-Id} header if present (so a reverse
 *   proxy or upstream service can correlate requests end-to-end).
 * - Otherwise generates a new UUID.
 * - Adds the value to the SLF4J MDC under {@code traceId}, used by
 *   {@code GlobalExceptionHandler} when building ApiError responses and
 *   by the JSON log pattern in production.
 * - Reflects the value back as {@code X-Trace-Id} so clients can include
 *   it in support tickets.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String HEADER  = "X-Trace-Id";
    public static final String MDC_KEY = "traceId";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {
        String traceId = sanitize(request.getHeader(HEADER));
        if (traceId == null) {
            traceId = UUID.randomUUID().toString();
        }
        MDC.put(MDC_KEY, traceId);
        response.setHeader(HEADER, traceId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    /** Trim and reject suspicious header values to avoid log injection. */
    private static String sanitize(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty() || s.length() > 64) return null;
        // Allow alphanumerics + dash/underscore/dot only.
        return s.matches("^[A-Za-z0-9._-]+$") ? s : null;
    }
}
