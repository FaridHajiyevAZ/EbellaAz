package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.CreateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.response.HomeSectionAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.service.HomepageSectionService;
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

@Tag(name = "Admin · CMS: Homepage Sections")
@RestController
@RequestMapping("/admin/home-sections")
@RequiredArgsConstructor
public class AdminHomepageSectionController {

    private final HomepageSectionService service;

    @GetMapping
    public List<HomeSectionAdminDto> list() { return service.listAdmin(); }

    @GetMapping("/{id}")
    public HomeSectionAdminDto get(@PathVariable UUID id) { return service.getAdmin(id); }

    @PostMapping
    public ResponseEntity<HomeSectionAdminDto> create(@Valid @RequestBody CreateHomeSectionRequest request) {
        HomeSectionAdminDto created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public HomeSectionAdminDto update(@PathVariable UUID id, @Valid @RequestBody UpdateHomeSectionRequest request) {
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
