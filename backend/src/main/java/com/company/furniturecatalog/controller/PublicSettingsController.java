package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.service.SiteSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@Tag(name = "Public · Settings")
@RestController
@RequestMapping("/public/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SiteSettingService service;

    @Operation(summary = "Public site settings keyed by name (site.name, whatsapp.number, social.instagram, ...)")
    @GetMapping
    public ResponseEntity<Map<String, Object>> bundle() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .body(service.getPublicBundle());
    }
}
