package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.SiteSetting;
import com.company.furniturecatalog.dto.admin.request.UpsertSiteSettingRequest;
import com.company.furniturecatalog.dto.admin.response.SiteSettingAdminDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.SiteSettingMapper;
import com.company.furniturecatalog.repository.SiteSettingRepository;
import com.company.furniturecatalog.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class SiteSettingServiceImpl implements SiteSettingService {

    private final SiteSettingRepository repository;
    private final SiteSettingMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<SiteSettingAdminDto> listAdmin() {
        return repository.findAll().stream().map(mapper::toAdminDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SiteSettingAdminDto getAdmin(String key) {
        return mapper.toAdminDto(load(key));
    }

    @Override
    public SiteSettingAdminDto upsert(String key, UpsertSiteSettingRequest request) {
        SiteSetting setting = repository.findById(key).orElseGet(() -> {
            SiteSetting fresh = new SiteSetting();
            fresh.setKey(key);
            return fresh;
        });
        setting.setValue(request.value());
        if (request.description() != null) setting.setDescription(request.description());
        if (request.publicSetting() != null) setting.setPublicSetting(request.publicSetting());
        return mapper.toAdminDto(repository.save(setting));
    }

    @Override
    public void delete(String key) {
        if (!repository.existsById(key)) {
            throw NotFoundException.of("SiteSetting", key);
        }
        repository.deleteById(key);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPublicBundle() {
        Map<String, Object> out = new LinkedHashMap<>();
        for (SiteSetting s : repository.findByPublicSettingTrue()) {
            out.put(s.getKey(), s.getValue());
        }
        return out;
    }

    private SiteSetting load(String key) {
        return repository.findById(key)
                .orElseThrow(() -> NotFoundException.of("SiteSetting", key));
    }
}
