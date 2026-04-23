package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.domain.ProductVariationImage;
import com.company.furniturecatalog.dto.admin.request.CreateProductRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateProductRequest;
import com.company.furniturecatalog.dto.admin.response.ProductAdminDetailDto;
import com.company.furniturecatalog.dto.admin.response.ProductAdminListItemDto;
import com.company.furniturecatalog.dto.publicapi.BreadcrumbDto;
import com.company.furniturecatalog.dto.publicapi.ProductCardDto;
import com.company.furniturecatalog.dto.publicapi.ProductDetailDto;
import com.company.furniturecatalog.dto.publicapi.ProductVariationPublicDto;
import com.company.furniturecatalog.dto.publicapi.WhatsAppInquiryDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Mapper(
        config = CatalogMapperConfig.class,
        uses = {
                CategoryMapper.class,
                ProductVariationMapper.class,
                StorageUrlResolver.class
        }
)
public interface ProductMapper {

    // --- Entity creation / updates --------------------------------------

    @Mapping(target = "category",   ignore = true)  // service resolves by id
    @Mapping(target = "variations", ignore = true)
    @Mapping(target = "featured",   source = "featured", defaultValue = "false")
    Product toEntity(CreateProductRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "sku",              source = "sku")
    @Mapping(target = "slug",             source = "slug")
    @Mapping(target = "name",             source = "name")
    @Mapping(target = "brand",            source = "brand")
    @Mapping(target = "shortDescription", source = "shortDescription")
    @Mapping(target = "longDescription",  source = "longDescription")
    @Mapping(target = "dimensions",       source = "dimensions")
    @Mapping(target = "materials",        source = "materials")
    @Mapping(target = "specs",            source = "specs")
    @Mapping(target = "status",           source = "status")
    @Mapping(target = "featured",         source = "featured")
    @Mapping(target = "sortOrder",        source = "sortOrder")
    @Mapping(target = "metaTitle",        source = "metaTitle")
    @Mapping(target = "metaDescription",  source = "metaDescription")
    void updateEntity(UpdateProductRequest request, @MappingTarget Product entity);

    // --- Public responses -----------------------------------------------

    /**
     * Card-sized DTO for listings. The service passes in the chosen cover
     * image URL and color swatches so the mapper stays pure.
     */
    ProductCardDto toCard(Product product, String coverImageUrl, List<String> availableColorHexes);

    /**
     * Product detail. Breadcrumbs + WhatsApp inquiry are computed by the
     * service and passed in as parameters — no DB access in the mapper.
     */
    @Mapping(target = "breadcrumbs",        source = "breadcrumbs")
    @Mapping(target = "defaultVariationId", source = "defaultVariationId")
    @Mapping(target = "whatsappInquiry",    source = "whatsappInquiry")
    @Mapping(target = "variations",
             expression = "java(mapVariations(product, urlResolver, variationMapper, imageMapper))")
    ProductDetailDto toDetailDto(Product product,
                                 List<BreadcrumbDto> breadcrumbs,
                                 UUID defaultVariationId,
                                 WhatsAppInquiryDto whatsappInquiry,
                                 StorageUrlResolver urlResolver,
                                 ProductVariationMapper variationMapper,
                                 ProductVariationImageMapper imageMapper);

    default List<ProductVariationPublicDto> mapVariations(Product product,
                                                          StorageUrlResolver urlResolver,
                                                          ProductVariationMapper variationMapper,
                                                          ProductVariationImageMapper imageMapper) {
        if (product == null || product.getVariations() == null) return List.of();
        List<ProductVariationPublicDto> out = new ArrayList<>(product.getVariations().size());
        for (ProductVariation v : product.getVariations()) {
            out.add(variationMapper.toPublicDto(v, urlResolver, imageMapper));
        }
        return out;
    }

    // --- Admin responses ------------------------------------------------

    @Mapping(target = "categoryId",      source = "product.category.id")
    @Mapping(target = "categoryName",    source = "product.category.name")
    @Mapping(target = "variationsCount", expression = "java(product.getVariations() == null ? 0 : product.getVariations().size())")
    @Mapping(target = "coverImageUrl",   expression = "java(resolveCover(product, urlResolver))")
    ProductAdminListItemDto toAdminListItem(Product product, StorageUrlResolver urlResolver);

    @Mapping(target = "categoryId",   source = "product.category.id")
    @Mapping(target = "categoryName", source = "product.category.name")
    @Mapping(target = "variations",
             expression = "java(mapAdminVariations(product, urlResolver, variationMapper, imageMapper))")
    ProductAdminDetailDto toAdminDetail(Product product,
                                        StorageUrlResolver urlResolver,
                                        ProductVariationMapper variationMapper,
                                        ProductVariationImageMapper imageMapper);

    default List<com.company.furniturecatalog.dto.admin.response.VariationAdminDto> mapAdminVariations(
            Product product,
            StorageUrlResolver urlResolver,
            ProductVariationMapper variationMapper,
            ProductVariationImageMapper imageMapper) {
        if (product == null || product.getVariations() == null) return List.of();
        List<com.company.furniturecatalog.dto.admin.response.VariationAdminDto> out =
                new ArrayList<>(product.getVariations().size());
        for (ProductVariation v : product.getVariations()) {
            out.add(variationMapper.toAdminDto(v, urlResolver, imageMapper));
        }
        return out;
    }

    // --- Helpers --------------------------------------------------------

    /**
     * Picks the lowest-sort_order image from the default variation (or the
     * first active variation) for the list/cover representation.
     */
    default String resolveCover(Product product, StorageUrlResolver urlResolver) {
        if (product == null || product.getVariations() == null || product.getVariations().isEmpty()) return null;

        ProductVariation target = product.getVariations().stream()
                .filter(ProductVariation::isDefaultVariation)
                .findFirst()
                .orElse(product.getVariations().get(0));

        if (target.getPrimaryImage() != null) {
            return urlResolver.publicUrl(target.getPrimaryImage().getStorageKey());
        }
        return target.getImages().stream()
                .min(Comparator.comparingInt(ProductVariationImage::getSortOrder))
                .map(i -> urlResolver.publicUrl(i.getStorageKey()))
                .orElse(null);
    }

    /** Breadcrumb chain from the product's category up to the root. */
    default List<BreadcrumbDto> breadcrumbsOf(Product product, CategoryMapper categoryMapper) {
        if (product == null || product.getCategory() == null) return List.of();
        List<BreadcrumbDto> chain = new ArrayList<>();
        Category cursor = product.getCategory();
        while (cursor != null) {
            chain.add(0, categoryMapper.toBreadcrumb(cursor));
            cursor = cursor.getParent();
        }
        return chain;
    }
}
