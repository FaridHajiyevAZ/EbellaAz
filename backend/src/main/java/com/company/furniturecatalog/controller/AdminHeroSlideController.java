package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.CreateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.service.HeroSlideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Tag(name = "Admin · CMS: Hero Slides")
@RestController
@RequestMapping("/admin/hero-slides")
@RequiredArgsConstructor
public class AdminHeroSlideController {

    private final HeroSlideService service;

    @GetMapping
    public List<HeroSlideAdminDto> list() { return service.listAdmin(); }

    @GetMapping("/{id}")
    public HeroSlideAdminDto get(@PathVariable UUID id) { return service.getAdmin(id); }

    @Operation(summary = "Create a hero slide",
               description = "imageKey can be set later via PUT /admin/media/hero-slides/{id}/image")
    @PostMapping
    public ResponseEntity<HeroSlideAdminDto> create(@Valid @RequestBody CreateHeroSlideRequest request) {
        HeroSlideAdminDto created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public HeroSlideAdminDto update(@PathVariable UUID id, @Valid @RequestBody UpdateHeroSlideRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@Valid @RequestBody ReorderRequest request) {
        service.reorder(request);
        return ResponseEntity.noContent().build();
    }
}
