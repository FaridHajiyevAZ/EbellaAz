package com.company.furniturecatalog.dto.admin.response;

import java.time.OffsetDateTime;

public record SiteSettingAdminDto(
        String key,
        Object value,
        String description,
        boolean publicSetting,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
