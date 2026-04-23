package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.HeroSlide;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.dto.admin.request.CreateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.HeroSlidePublicDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.HeroSlideMapper;
import com.company.furniturecatalog.repository.HeroSlideRepository;
import com.company.furniturecatalog.service.HeroSlideService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class HeroSlideServiceImpl implements HeroSlideService {

    private final HeroSlideRepository repository;
    private final HeroSlideMapper mapper;
    private final StorageUrlResolver urlResolver;

    @Override
    public HeroSlideAdminDto create(CreateHeroSlideRequest request) {
        HeroSlide slide = mapper.toEntity(request);
        return mapper.toAdminDto(repository.save(slide), urlResolver);
    }

    @Override
    public HeroSlideAdminDto update(UUID id, UpdateHeroSlideRequest request) {
        HeroSlide slide = loadLive(id);
        mapper.updateEntity(request, slide);
        return mapper.toAdminDto(slide, urlResolver);
    }

    @Override
    public void delete(UUID id) {
        loadLive(id).markDeleted();
    }

    @Override
    @Transactional(readOnly = true)
    public HeroSlideAdminDto getAdmin(UUID id) {
        return mapper.toAdminDto(loadLive(id), urlResolver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeroSlideAdminDto> listAdmin() {
        return repository.findByDeletedAtIsNullOrderBySortOrderAsc().stream()
                .map(s -> mapper.toAdminDto(s, urlResolver))
                .toList();
    }

    @Override
    public void reorder(ReorderRequest request) {
        Map<UUID, Integer> byId = new HashMap<>();
        request.items().forEach(i -> byId.put(i.id(), i.sortOrder()));
        for (HeroSlide slide : repository.findByDeletedAtIsNullOrderBySortOrderAsc()) {
            Integer order = byId.get(slide.getId());
            if (order != null) slide.setSortOrder(order);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeroSlidePublicDto> listPublic() {
        return repository.findActiveAt(ContentStatus.PUBLISHED, OffsetDateTime.now()).stream()
                .map(s -> mapper.toPublicDto(s, urlResolver))
                .toList();
    }

    private HeroSlide loadLive(UUID id) {
        return repository.findById(id)
                .filter(s -> s.getDeletedAt() == null)
                .orElseThrow(() -> NotFoundException.of("HeroSlide", id));
    }
}
