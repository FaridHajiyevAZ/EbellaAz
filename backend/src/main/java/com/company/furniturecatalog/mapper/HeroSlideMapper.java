package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.HeroSlide;
import com.company.furniturecatalog.dto.admin.request.CreateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateHeroSlideRequest;
import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.publicapi.HeroSlidePublicDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = CatalogMapperConfig.class, uses = StorageUrlResolver.class)
public interface HeroSlideMapper {

    HeroSlide toEntity(CreateHeroSlideRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "title",     source = "title")
    @Mapping(target = "subtitle",  source = "subtitle")
    @Mapping(target = "ctaText",   source = "ctaText")
    @Mapping(target = "ctaUrl",    source = "ctaUrl")
    @Mapping(target = "imageKey",  source = "imageKey")
    @Mapping(target = "sortOrder", source = "sortOrder")
    @Mapping(target = "status",    source = "status")
    @Mapping(target = "startsAt",  source = "startsAt")
    @Mapping(target = "endsAt",    source = "endsAt")
    void updateEntity(UpdateHeroSlideRequest request, @MappingTarget HeroSlide entity);

    @Mapping(target = "imageUrl", expression = "java(urlResolver.publicUrl(slide.getImageKey()))")
    HeroSlidePublicDto toPublicDto(HeroSlide slide, StorageUrlResolver urlResolver);

    @Mapping(target = "imageUrl", expression = "java(urlResolver.publicUrl(slide.getImageKey()))")
    HeroSlideAdminDto toAdminDto(HeroSlide slide, StorageUrlResolver urlResolver);
}
