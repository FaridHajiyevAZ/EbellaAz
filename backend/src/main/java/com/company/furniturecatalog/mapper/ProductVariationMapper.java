package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.dto.admin.request.CreateVariationRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateVariationRequest;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;
import com.company.furniturecatalog.dto.publicapi.ProductVariationPublicDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(
        config = CatalogMapperConfig.class,
        uses = { ProductVariationImageMapper.class, StorageUrlResolver.class }
)
public interface ProductVariationMapper {

    // --- Entity creation / updates --------------------------------------

    @Mapping(target = "product",            ignore = true)
    @Mapping(target = "images",             ignore = true)
    @Mapping(target = "primaryImage",       ignore = true)
    @Mapping(target = "defaultVariation",   source = "isDefault")
    ProductVariation toEntity(CreateVariationRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "colorName",        source = "colorName")
    @Mapping(target = "colorHex",         source = "colorHex")
    @Mapping(target = "variationSku",     source = "variationSku")
    @Mapping(target = "stockStatusText",  source = "stockStatusText")
    @Mapping(target = "defaultVariation", source = "isDefault")
    @Mapping(target = "sortOrder",        source = "sortOrder")
    @Mapping(target = "status",           source = "status")
    void updateEntity(UpdateVariationRequest request, @MappingTarget ProductVariation entity);

    // --- Public response ------------------------------------------------

    @Mapping(target = "isDefault",      source = "variation.defaultVariation")
    @Mapping(target = "primaryImageId", source = "variation.primaryImage.id")
    @Mapping(target = "images",
             expression = "java(imageMapper.toPublicDtos(variation.getImages(), urlResolver))")
    ProductVariationPublicDto toPublicDto(ProductVariation variation,
                                          StorageUrlResolver urlResolver,
                                          ProductVariationImageMapper imageMapper);

    // --- Admin response -------------------------------------------------

    @Mapping(target = "productId",      source = "variation.product.id")
    @Mapping(target = "isDefault",      source = "variation.defaultVariation")
    @Mapping(target = "primaryImageId", source = "variation.primaryImage.id")
    @Mapping(target = "images",
             expression = "java(imageMapper.toAdminDtos(variation.getImages(), urlResolver))")
    VariationAdminDto toAdminDto(ProductVariation variation,
                                 StorageUrlResolver urlResolver,
                                 ProductVariationImageMapper imageMapper);
}
