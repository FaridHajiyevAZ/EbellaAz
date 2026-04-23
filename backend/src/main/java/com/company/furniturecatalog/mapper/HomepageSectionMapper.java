package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.HomepageSection;
import com.company.furniturecatalog.dto.admin.request.CreateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHomeSectionRequest;
import com.company.furniturecatalog.dto.admin.response.HomeSectionAdminDto;
import com.company.furniturecatalog.dto.publicapi.HomeSectionPublicDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = CatalogMapperConfig.class)
public interface HomepageSectionMapper {

    HomepageSection toEntity(CreateHomeSectionRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "sectionType", source = "sectionType")
    @Mapping(target = "title",       source = "title")
    @Mapping(target = "subtitle",    source = "subtitle")
    @Mapping(target = "config",      source = "config")
    @Mapping(target = "sortOrder",   source = "sortOrder")
    @Mapping(target = "status",      source = "status")
    void updateEntity(UpdateHomeSectionRequest request, @MappingTarget HomepageSection entity);

    @Mapping(target = "type", source = "sectionType")
    HomeSectionPublicDto toPublicDto(HomepageSection section);

    HomeSectionAdminDto toAdminDto(HomepageSection section);
}
