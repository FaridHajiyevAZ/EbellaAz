package com.company.furniturecatalog.security;

import com.company.furniturecatalog.config.properties.JwtProperties;
import com.company.furniturecatalog.domain.AdminUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Issues and parses HS256 JWTs used for admin authentication.
 *
 * Tokens come in two flavours keyed by the {@code typ} claim:
 *  - "access"  — short-lived, sent on every protected request.
 *  - "refresh" — longer-lived, accepted only by the refresh endpoint.
 *
 * The signing key is derived from {@code app.security.jwt.secret}; secrets
 * shorter than 256 bits are rejected by jjwt at startup, which is intentional.
 */
@Service
public class JwtService {

    public static final String TOKEN_TYPE_ACCESS  = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] bytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(bytes);
    }

    public String issueAccessToken(AdminUser user) {
        return issue(user, TOKEN_TYPE_ACCESS, properties.accessTokenTtl());
    }

    public String issueRefreshToken(AdminUser user) {
        return issue(user, TOKEN_TYPE_REFRESH, properties.refreshTokenTtl());
    }

    public Jws<Claims> parse(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(properties.issuer())
                .build()
                .parseSignedClaims(token);
    }

    public UUID extractUserId(Jws<Claims> jws) {
        return UUID.fromString(jws.getPayload().getSubject());
    }

    public String extractTokenType(Jws<Claims> jws) {
        return jws.getPayload().get("typ", String.class);
    }

    public Duration accessTokenTtl() {
        return properties.accessTokenTtl();
    }

    // ----------------------------------------------------------------

    private String issue(AdminUser user, String type, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(user.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .claim("email", user.getEmail())
                .claim("role",  user.getRole().name())
                .claim("name",  user.getFullName())
                .claim("typ",   type)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }
}
