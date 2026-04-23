package com.company.furniturecatalog.dto.publicapi;

/**
 * Prebuilt WhatsApp inquiry payload. The backend assembles the message from
 * the SiteSetting template + product + default variation so the React app can
 * render the button with a single wa.me link.
 */
public record WhatsAppInquiryDto(
        String phoneNumber,   // digits-only, e.g. "994550000000"
        String message,       // pre-filled, plain text (URL-decoded)
        String url            // ready-to-use https://wa.me/<phone>?text=<encoded>
) {}
