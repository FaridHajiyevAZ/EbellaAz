package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.ProductVariationImage;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.dto.publicapi.ProductImageDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = CatalogMapperConfig.class, uses = StorageUrlResolver.class)
public interface ProductVariationImageMapper {

    @Mapping(target = "url",        expression = "java(urlResolver.publicUrl(image.getStorageKey()))")
    @Mapping(target = "renditions", expression = "java(urlResolver.publicUrls(image.getRenditions()))")
    ProductImageDto toPublicDto(ProductVariationImage image, StorageUrlResolver urlResolver);

    List<ProductImageDto> toPublicDtos(List<ProductVariationImage> images, StorageUrlResolver urlResolver);

    @Mapping(target = "variationId", source = "image.variation.id")
    @Mapping(target = "url",         expression = "java(urlResolver.publicUrl(image.getStorageKey()))")
    @Mapping(target = "renditions",  expression = "java(urlResolver.publicUrls(image.getRenditions()))")
    ImageAdminDto toAdminDto(ProductVariationImage image, StorageUrlResolver urlResolver);

    List<ImageAdminDto> toAdminDtos(List<ProductVariationImage> images, StorageUrlResolver urlResolver);
}
