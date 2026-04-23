package com.company.furniturecatalog.dto.admin.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record CreateContactInfoRequest(
        @NotBlank @Size(max = 120) String label,
        @Size(max = 10)  String locale,
        @Size(max = 40)  String phone,
        @Email @Size(max = 160) String email,
        @Pattern(regexp = "^\\d{6,20}$", message = "whatsappNumber must be digits only")
        String whatsappNumber,
        @Size(max = 200) String addressLine1,
        @Size(max = 200) String addressLine2,
        @Size(max = 120) String city,
        @Size(max = 120) String country,
        @Size(max = 20)  String postalCode,
        @Size(max = 500) String mapUrl,
        Map<String, String> workingHours,
        Boolean primary
) {}
