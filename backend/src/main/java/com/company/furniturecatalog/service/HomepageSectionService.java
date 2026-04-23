package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.CreateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.response.HomeSectionAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.HomeSectionPublicDto;

import java.util.List;
import java.util.UUID;

public interface HomepageSectionService {

    HomeSectionAdminDto create(CreateHomeSectionRequest request);

    HomeSectionAdminDto update(UUID id, UpdateHomeSectionRequest request);

    void delete(UUID id);

    HomeSectionAdminDto getAdmin(UUID id);

    List<HomeSectionAdminDto> listAdmin();

    void reorder(ReorderRequest request);

    List<HomeSectionPublicDto> listPublic();
}
