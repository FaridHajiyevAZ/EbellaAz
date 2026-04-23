package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.domain.enums.HomeSectionType;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record UpdateHomeSectionRequest(
        HomeSectionType sectionType,
        @Size(max = 200) String title,
        @Size(max = 400) String subtitle,
        String body,
        String imageKey,
        Map<String, Object> config,
        @PositiveOrZero Integer sortOrder,
        ContentStatus status
) {}
