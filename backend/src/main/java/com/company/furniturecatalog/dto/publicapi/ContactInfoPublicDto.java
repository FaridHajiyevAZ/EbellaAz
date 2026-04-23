package com.company.furniturecatalog.dto.publicapi;

import java.util.List;
import java.util.Map;

public record ContactInfoPublicDto(
        String label,
        String phone,
        String email,
        String whatsappNumber,
        List<String> addressLines,
        String city,
        String country,
        String mapUrl,
        Map<String, String> workingHours
) {}
