package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.publicapi.HomePagePayloadDto;
import com.company.furniturecatalog.service.HeroSlideService;
import com.company.furniturecatalog.service.HomepageSectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;

/**
 * Single-call homepage payload: hero slides + ordered sections. Featured
 * products are intentionally omitted here — the React app fetches them via
 * /public/products?featured=true so those queries share the product cache.
 */
@Tag(name = "Public · Home")
@RestController
@RequestMapping("/public/home")
@RequiredArgsConstructor
public class PublicHomeController {

    private final HeroSlideService heroSlideService;
    private final HomepageSectionService sectionService;

    @Operation(summary = "Hero slides + homepage sections for the landing page")
    @GetMapping
    public ResponseEntity<HomePagePayloadDto> home() {
        HomePagePayloadDto body = new HomePagePayloadDto(
                heroSlideService.listPublic(),
                sectionService.listPublic(),
                List.of()
        );
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(2)).cachePublic())
                .body(body);
    }
}
