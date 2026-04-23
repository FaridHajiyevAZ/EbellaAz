package com.company.furniturecatalog.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Parses the {@code Authorization: Bearer <jwt>} header on each request and,
 * if valid, populates the SecurityContext with an {@link AdminUserDetails}
 * principal. Invalid / missing tokens fall through: downstream authorization
 * rules decide whether the endpoint requires authentication.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final AdminUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(AUTH_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            // Already authenticated earlier in the chain; don't stomp on it.
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length()).trim();
        try {
            Jws<Claims> jws = jwtService.parse(token);

            // Refresh tokens must not authenticate regular requests.
            if (!JwtService.TOKEN_TYPE_ACCESS.equals(jwtService.extractTokenType(jws))) {
                chain.doFilter(request, response);
                return;
            }

            UUID userId = jwtService.extractUserId(jws);
            AdminUserDetails principal = userDetailsService.loadById(userId);

            if (!principal.isEnabled()) {
                // Account disabled after the token was issued — refuse silently.
                chain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, principal.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (JwtException ex) {
            log.debug("Rejecting invalid JWT on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        } catch (UsernameNotFoundException ex) {
            log.debug("JWT references an unknown admin id: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.debug("Malformed JWT subject: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }
}
