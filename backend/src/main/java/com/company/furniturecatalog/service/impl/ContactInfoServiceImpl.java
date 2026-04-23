package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.ContactInfo;
import com.company.furniturecatalog.dto.admin.request.CreateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.response.ContactInfoAdminDto;
import com.company.furniturecatalog.dto.publicapi.ContactInfoPublicDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.ContactInfoMapper;
import com.company.furniturecatalog.repository.ContactInfoRepository;
import com.company.furniturecatalog.service.ContactInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ContactInfoServiceImpl implements ContactInfoService {

    private final ContactInfoRepository repository;
    private final ContactInfoMapper mapper;

    @Override
    public ContactInfoAdminDto create(CreateContactInfoRequest request) {
        ContactInfo contact = mapper.toEntity(request);
        return mapper.toAdminDto(repository.save(contact));
    }

    @Override
    public ContactInfoAdminDto update(UUID id, UpdateContactInfoRequest request) {
        ContactInfo contact = loadOrThrow(id);
        mapper.updateEntity(request, contact);
        return mapper.toAdminDto(contact);
    }

    @Override
    public void delete(UUID id) {
        ContactInfo contact = loadOrThrow(id);
        repository.delete(contact);
    }

    @Override
    @Transactional(readOnly = true)
    public ContactInfoAdminDto getAdmin(UUID id) {
        return mapper.toAdminDto(loadOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactInfoAdminDto> listAdmin() {
        return repository.findAll().stream().map(mapper::toAdminDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ContactInfoPublicDto> getPublicPrimary(String locale) {
        Optional<ContactInfo> contact = (locale == null || locale.isBlank())
                ? repository.findFirstByPrimaryTrue()
                : repository.findFirstByPrimaryTrueAndLocale(locale)
                           .or(repository::findFirstByPrimaryTrue);
        return contact.map(mapper::toPublicDto);
    }

    private ContactInfo loadOrThrow(UUID id) {
        return repository.findById(id).orElseThrow(() -> NotFoundException.of("ContactInfo", id));
    }
}
