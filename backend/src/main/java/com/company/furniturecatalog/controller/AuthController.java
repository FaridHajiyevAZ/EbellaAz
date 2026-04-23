package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.LoginRequest;
import com.company.furniturecatalog.dto.admin.request.RefreshTokenRequest;
import com.company.furniturecatalog.dto.admin.response.AdminProfileDto;
import com.company.furniturecatalog.dto.admin.response.TokenResponse;
import com.company.furniturecatalog.security.AdminUserDetails;
import com.company.furniturecatalog.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Admin authentication")
@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Exchange email + password for an access + refresh token pair")
    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Issue a fresh access + refresh token pair from a valid refresh token")
    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @Operation(summary = "Current admin profile", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<AdminProfileDto> me(@AuthenticationPrincipal AdminUserDetails principal) {
        if (principal == null) {
            // Matches RestAuthenticationEntryPoint behaviour for missing credentials.
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.me(principal.getUserId()));
    }
}
