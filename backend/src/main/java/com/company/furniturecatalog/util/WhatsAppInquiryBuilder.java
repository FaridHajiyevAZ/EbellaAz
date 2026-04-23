package com.company.furniturecatalog.util;

import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.dto.publicapi.WhatsAppInquiryDto;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Pure helper: given a phone number, a message template, and the context
 * (product + variation + PDP url), returns a ready-to-use WhatsApp inquiry.
 *
 * Template placeholders: {product_name}, {sku}, {color}, {product_url}, {brand}.
 * Service layer fetches the number/template from SiteSetting and calls this.
 */
@Component
public class WhatsAppInquiryBuilder {

    private static final String DEFAULT_TEMPLATE =
            "Hello, I am interested in {product_name} ({color}). Link: {product_url}";

    public WhatsAppInquiryDto build(String phoneNumberDigits,
                                    String templateOrNull,
                                    Product product,
                                    ProductVariation selectedVariation,
                                    String productUrl) {
        if (phoneNumberDigits == null || phoneNumberDigits.isBlank()) {
            return null;
        }

        String template = (templateOrNull == null || templateOrNull.isBlank())
                ? DEFAULT_TEMPLATE
                : templateOrNull;

        String color = selectedVariation == null ? "" : selectedVariation.getColorName();
        Map<String, String> values = Map.of(
                "product_name", nullToEmpty(product.getName()),
                "sku",          nullToEmpty(product.getSku()),
                "color",        nullToEmpty(color),
                "brand",        nullToEmpty(product.getBrand()),
                "product_url",  nullToEmpty(productUrl)
        );

        String message = applyTemplate(template, values);
        String url = "https://wa.me/" + phoneNumberDigits
                + "?text=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        return new WhatsAppInquiryDto(phoneNumberDigits, message, url);
    }

    private static String applyTemplate(String template, Map<String, String> values) {
        String out = template;
        for (Map.Entry<String, String> e : values.entrySet()) {
            out = out.replace("{" + e.getKey() + "}", e.getValue());
        }
        return out;
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
