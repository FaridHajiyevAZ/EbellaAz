package com.company.furniturecatalog.dto.admin.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Upsert site setting. {@code key} is the path variable on the endpoint side,
 * so only {@code value} / {@code description} / {@code publicSetting} are in the body.
 */
public record UpsertSiteSettingRequest(
        @NotNull Object value,
        @Size(max = 255) String description,
        Boolean publicSetting
) {}
