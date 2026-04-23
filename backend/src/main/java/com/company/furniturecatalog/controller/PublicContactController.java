package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.publicapi.ContactInfoPublicDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.service.ContactInfoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@Tag(name = "Public · Contact")
@RestController
@RequestMapping("/public/contact")
@RequiredArgsConstructor
public class PublicContactController {

    private final ContactInfoService service;

    @GetMapping
    public ResponseEntity<ContactInfoPublicDto> primary(
            @RequestParam(value = "locale", required = false) String locale
    ) {
        ContactInfoPublicDto body = service.getPublicPrimary(locale)
                .orElseThrow(() -> new NotFoundException("No primary contact info is configured"));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .body(body);
    }
}
