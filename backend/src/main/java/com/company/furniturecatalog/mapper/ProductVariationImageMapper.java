package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.ProductVariationImage;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.dto.publicapi.ProductImageDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;

@Mapper(config = CatalogMapperConfig.class, uses = StorageUrlResolver.class)
public interface ProductVariationImageMapper {

    @Mapping(target = "url",        expression = "java(urlResolver.publicUrl(image.getStorageKey()))")
    @Mapping(target = "renditions", expression = "java(urlResolver.publicUrls(image.getRenditions()))")
    ProductImageDto toPublicDto(ProductVariationImage image, StorageUrlResolver urlResolver);

    @Mapping(target = "variationId", source = "image.variation.id")
    @Mapping(target = "url",         expression = "java(urlResolver.publicUrl(image.getStorageKey()))")
    @Mapping(target = "renditions",  expression = "java(urlResolver.publicUrls(image.getRenditions()))")
    ImageAdminDto toAdminDto(ProductVariationImage image, StorageUrlResolver urlResolver);

    /* ---------------------------------------------------------------
     * Bulk mappers. MapStruct won't auto-generate list-to-list for
     * single-item methods that take extra parameters, so we loop by
     * hand in default methods.
     * --------------------------------------------------------------- */

    default List<ProductImageDto> toPublicDtos(List<ProductVariationImage> images, StorageUrlResolver urlResolver) {
        if (images == null) return List.of();
        List<ProductImageDto> out = new ArrayList<>(images.size());
        for (ProductVariationImage img : images) {
            out.add(toPublicDto(img, urlResolver));
        }
        return out;
    }

    default List<ImageAdminDto> toAdminDtos(List<ProductVariationImage> images, StorageUrlResolver urlResolver) {
        if (images == null) return List.of();
        List<ImageAdminDto> out = new ArrayList<>(images.size());
        for (ProductVariationImage img : images) {
            out.add(toAdminDto(img, urlResolver));
        }
        return out;
    }
}
