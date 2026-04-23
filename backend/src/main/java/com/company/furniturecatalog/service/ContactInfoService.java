package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.CreateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.response.ContactInfoAdminDto;
import com.company.furniturecatalog.dto.publicapi.ContactInfoPublicDto;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContactInfoService {

    ContactInfoAdminDto create(CreateContactInfoRequest request);

    ContactInfoAdminDto update(UUID id, UpdateContactInfoRequest request);

    void delete(UUID id);

    ContactInfoAdminDto getAdmin(UUID id);

    List<ContactInfoAdminDto> listAdmin();

    /** Public consumption: the primary contact row (optionally per-locale). */
    Optional<ContactInfoPublicDto> getPublicPrimary(String locale);
}
