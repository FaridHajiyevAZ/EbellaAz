package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.CreateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.HeroSlidePublicDto;

import java.util.List;
import java.util.UUID;

public interface HeroSlideService {

    HeroSlideAdminDto create(CreateHeroSlideRequest request);

    HeroSlideAdminDto update(UUID id, UpdateHeroSlideRequest request);

    void delete(UUID id);

    HeroSlideAdminDto getAdmin(UUID id);

    List<HeroSlideAdminDto> listAdmin();

    void reorder(ReorderRequest request);

    /** Returns PUBLISHED slides whose optional time window includes "now". */
    List<HeroSlidePublicDto> listPublic();
}
