package com.company.furniturecatalog.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Baseline security:
 *  - Stateless, no sessions, no CSRF (JWT-based API).
 *  - Public endpoints are open; everything under /admin requires auth (wired once JwtAuthFilter is added).
 *  - CORS is delegated to WebConfig.
 *
 * The JwtAuthFilter placeholder is intentionally omitted here; drop it in when implementing auth.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt with a reasonable work factor. Raise in prod if CPU allows.
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${api.base-path:/api/v1}") String api
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // picks up CorsConfigurationSource from WebConfig
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Actuator health/info
                        .requestMatchers(new AntPathRequestMatcher("/actuator/health"),
                                         new AntPathRequestMatcher("/actuator/info")).permitAll()
                        // OpenAPI / Swagger
                        .requestMatchers(new AntPathRequestMatcher("/v3/api-docs/**"),
                                         new AntPathRequestMatcher("/swagger-ui.html"),
                                         new AntPathRequestMatcher("/swagger-ui/**")).permitAll()
                        // Static media (served from local storage)
                        .requestMatchers(new AntPathRequestMatcher("/media/**")).permitAll()
                        // Public catalog endpoints
                        .requestMatchers(new AntPathRequestMatcher(api + "/public/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher(api + "/admin/auth/login"),
                                         new AntPathRequestMatcher(api + "/admin/auth/refresh")).permitAll()
                        // Everything else requires auth
                        .requestMatchers(new AntPathRequestMatcher(api + "/admin/**")).authenticated()
                        .anyRequest().permitAll()
                );

        // .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
