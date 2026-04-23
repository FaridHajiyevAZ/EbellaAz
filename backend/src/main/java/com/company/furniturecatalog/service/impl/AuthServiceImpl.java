package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.domain.enums.AdminStatus;
import com.company.furniturecatalog.dto.admin.request.LoginRequest;
import com.company.furniturecatalog.dto.admin.response.AdminProfileDto;
import com.company.furniturecatalog.dto.admin.response.TokenResponse;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.repository.AdminUserRepository;
import com.company.furniturecatalog.security.JwtService;
import com.company.furniturecatalog.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final JwtService jwtService;

    @Override
    public TokenResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (DisabledException | LockedException e) {
            // The account exists but is disabled/locked — still surface as a bad credentials message
            // so we don't leak which accounts exist.
            throw new BadCredentialsException("Invalid email or password");
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        AdminUser user = adminUserRepository.findByEmailAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        adminUserRepository.updateLastLoginAt(user.getId(), OffsetDateTime.now());
        log.info("Admin login: {}", user.getEmail());
        return issueTokens(user);
    }

    @Override
    public TokenResponse refresh(String refreshToken) {
        Jws<Claims> jws;
        try {
            jws = jwtService.parse(refreshToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        if (!JwtService.TOKEN_TYPE_REFRESH.equals(jwtService.extractTokenType(jws))) {
            throw new BadCredentialsException("Not a refresh token");
        }

        UUID userId = jwtService.extractUserId(jws);
        AdminUser user = adminUserRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new BadCredentialsException("Account no longer exists"));

        if (user.getStatus() != AdminStatus.ACTIVE) {
            throw new BadCredentialsException("Account is disabled");
        }

        return issueTokens(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminProfileDto me(UUID userId) {
        AdminUser user = adminUserRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> NotFoundException.of("AdminUser", userId));
        return AdminProfileDto.from(user);
    }

    private TokenResponse issueTokens(AdminUser user) {
        String access  = jwtService.issueAccessToken(user);
        String refresh = jwtService.issueRefreshToken(user);
        return new TokenResponse(
                access,
                refresh,
                "Bearer",
                jwtService.accessTokenTtl().toSeconds(),
                AdminProfileDto.from(user)
        );
    }
}
