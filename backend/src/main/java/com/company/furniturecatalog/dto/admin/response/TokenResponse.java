package com.company.furniturecatalog.dto.admin.response;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,      // always "Bearer"
        long   expiresIn,      // seconds until access token expires
        AdminProfileDto admin
) {}
