package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.UpsertSiteSettingRequest;
import com.company.furniturecatalog.dto.admin.response.SiteSettingAdminDto;
import com.company.furniturecatalog.service.SiteSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin · CMS: Site Settings")
@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class AdminSiteSettingController {

    private final SiteSettingService service;

    @GetMapping
    public List<SiteSettingAdminDto> list() { return service.listAdmin(); }

    @GetMapping("/{key}")
    public SiteSettingAdminDto get(@PathVariable String key) { return service.getAdmin(key); }

    @Operation(summary = "Create or update a setting (upsert by key)")
    @PutMapping("/{key}")
    public SiteSettingAdminDto upsert(@PathVariable String key,
                                      @Valid @RequestBody UpsertSiteSettingRequest request) {
        return service.upsert(key, request);
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        service.delete(key);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
