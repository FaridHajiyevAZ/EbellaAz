package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.LoginRequest;
import com.company.furniturecatalog.dto.admin.request.RefreshTokenRequest;
import com.company.furniturecatalog.dto.admin.response.AdminProfileDto;
import com.company.furniturecatalog.dto.admin.response.TokenResponse;
import com.company.furniturecatalog.exception.ApiError;
import com.company.furniturecatalog.security.AdminUserDetails;
import com.company.furniturecatalog.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "Sign in",
            description = "Exchanges email + password for an access + refresh token pair."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tokens issued",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(
                            schema = @Schema(implementation = ApiError.class),
                            examples = @ExampleObject(
                                    name = "Bad credentials",
                                    value = """
                                            {
                                              "timestamp": "2026-04-23T10:12:03Z",
                                              "status": 401,
                                              "error": "Unauthorized",
                                              "message": "Authentication required",
                                              "path": "/api/v1/admin/auth/login"
                                            }""")))
    })
    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(
            summary = "Refresh tokens",
            description = "Issues a fresh access + refresh token pair from a valid refresh token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tokens reissued",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token invalid or expired",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @Operation(
            summary = "Current admin profile",
            description = "Returns the profile of the authenticated admin.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authenticated admin profile",
                    content = @Content(schema = @Schema(implementation = AdminProfileDto.class))),
            @ApiResponse(responseCode = "401", description = "No or invalid token",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/me")
    public ResponseEntity<AdminProfileDto> me(@AuthenticationPrincipal AdminUserDetails principal) {
        if (principal == null) {
            // Matches RestAuthenticationEntryPoint behaviour for missing credentials.
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.me(principal.getUserId()));
    }
}
