package com.company.furniturecatalog.dto.admin.response;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ContactInfoAdminDto(
        UUID id,
        String label,
        String locale,
        String phone,
        String email,
        String whatsappNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String country,
        String postalCode,
        String mapUrl,
        Map<String, String> workingHours,
        boolean primary,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
