package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.HomepageSection;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.dto.admin.request.CreateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.response.HomeSectionAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.HomeSectionPublicDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.HomepageSectionMapper;
import com.company.furniturecatalog.repository.HomepageSectionRepository;
import com.company.furniturecatalog.service.HomepageSectionService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class HomepageSectionServiceImpl implements HomepageSectionService {

    private final HomepageSectionRepository repository;
    private final HomepageSectionMapper mapper;
    private final StorageUrlResolver urlResolver;

    @Override
    public HomeSectionAdminDto create(CreateHomeSectionRequest request) {
        HomepageSection section = mapper.toEntity(request);
        return mapper.toAdminDto(repository.save(section), urlResolver);
    }

    @Override
    public HomeSectionAdminDto update(UUID id, UpdateHomeSectionRequest request) {
        HomepageSection section = loadLive(id);
        mapper.updateEntity(request, section);
        return mapper.toAdminDto(section, urlResolver);
    }

    @Override
    public void delete(UUID id) {
        loadLive(id).markDeleted();
    }

    @Override
    @Transactional(readOnly = true)
    public HomeSectionAdminDto getAdmin(UUID id) {
        return mapper.toAdminDto(loadLive(id), urlResolver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomeSectionAdminDto> listAdmin() {
        return repository.findByDeletedAtIsNullOrderBySortOrderAsc().stream()
                .map(s -> mapper.toAdminDto(s, urlResolver))
                .toList();
    }

    @Override
    public void reorder(ReorderRequest request) {
        Map<UUID, Integer> byId = new HashMap<>();
        request.items().forEach(i -> byId.put(i.id(), i.sortOrder()));
        for (HomepageSection s : repository.findByDeletedAtIsNullOrderBySortOrderAsc()) {
            Integer order = byId.get(s.getId());
            if (order != null) s.setSortOrder(order);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomeSectionPublicDto> listPublic() {
        return repository.findByStatusAndDeletedAtIsNullOrderBySortOrderAsc(ContentStatus.PUBLISHED).stream()
                .map(s -> mapper.toPublicDto(s, urlResolver))
                .toList();
    }

    private HomepageSection loadLive(UUID id) {
        return repository.findById(id)
                .filter(s -> s.getDeletedAt() == null)
                .orElseThrow(() -> NotFoundException.of("HomepageSection", id));
    }
}
