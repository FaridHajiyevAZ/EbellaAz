package com.company.furniturecatalog.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Stateless, JWT-based security for the admin surface.
 *
 * Public routes (site content, docs, media, auth endpoints) are open.
 * Everything under {@code /api/v1/admin/**} requires an authenticated
 * principal with role SUPER_ADMIN or EDITOR.
 *
 * Authentication flow:
 *   AuthenticationManager -> DaoAuthenticationProvider
 *   -> AdminUserDetailsService.loadUserByUsername(email)
 *   -> BCryptPasswordEncoder.matches(raw, hash)
 * Subsequent requests carry a Bearer token consumed by JwtAuthFilter.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Work factor 12 is a reasonable default for 2026-class hardware.
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(AdminUserDetailsService userDetailsService,
                                                               PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        provider.setHideUserNotFoundExceptions(true); // always a generic BadCredentials
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            @Value("${api.base-path:/api/v1}") String api
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // CorsConfigurationSource comes from WebConfig
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .exceptionHandling(h -> h
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // Actuator health/info
                        .requestMatchers(new AntPathRequestMatcher("/actuator/health"),
                                         new AntPathRequestMatcher("/actuator/info")).permitAll()
                        // OpenAPI / Swagger
                        .requestMatchers(new AntPathRequestMatcher("/v3/api-docs/**"),
                                         new AntPathRequestMatcher("/swagger-ui.html"),
                                         new AntPathRequestMatcher("/swagger-ui/**")).permitAll()
                        // Static media served from local storage
                        .requestMatchers(new AntPathRequestMatcher("/media/**")).permitAll()
                        // Public catalog + CMS routes
                        .requestMatchers(new AntPathRequestMatcher(api + "/public/**")).permitAll()
                        // Auth endpoints (login + refresh are intentionally open;
                        // /me stays authenticated via the generic /admin/** rule).
                        .requestMatchers(new AntPathRequestMatcher(api + "/admin/auth/login"),
                                         new AntPathRequestMatcher(api + "/admin/auth/refresh")).permitAll()
                        // Everything else under /admin requires an admin role
                        .requestMatchers(new AntPathRequestMatcher(api + "/admin/**"))
                                .hasAnyRole("SUPER_ADMIN", "EDITOR")
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
