package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.CreateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.response.ContactInfoAdminDto;
import com.company.furniturecatalog.service.ContactInfoService;
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

@Tag(name = "Admin · CMS: Contact Info")
@RestController
@RequestMapping("/admin/contact-info")
@RequiredArgsConstructor
public class AdminContactInfoController {

    private final ContactInfoService service;

    @GetMapping
    public List<ContactInfoAdminDto> list() { return service.listAdmin(); }

    @GetMapping("/{id}")
    public ContactInfoAdminDto get(@PathVariable UUID id) { return service.getAdmin(id); }

    @PostMapping
    public ResponseEntity<ContactInfoAdminDto> create(@Valid @RequestBody CreateContactInfoRequest request) {
        ContactInfoAdminDto created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ContactInfoAdminDto update(@PathVariable UUID id, @Valid @RequestBody UpdateContactInfoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
