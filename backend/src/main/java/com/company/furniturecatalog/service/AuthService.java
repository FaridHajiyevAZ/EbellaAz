package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.LoginRequest;
import com.company.furniturecatalog.dto.admin.response.AdminProfileDto;
import com.company.furniturecatalog.dto.admin.response.TokenResponse;

import java.util.UUID;

public interface AuthService {

    TokenResponse login(LoginRequest request);

    TokenResponse refresh(String refreshToken);

    AdminProfileDto me(UUID userId);
}
