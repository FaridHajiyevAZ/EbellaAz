package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.domain.SiteSetting;
import com.company.furniturecatalog.domain.enums.ProductStatus;
import com.company.furniturecatalog.dto.admin.request.CreateProductRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateProductRequest;
import com.company.furniturecatalog.dto.admin.response.ProductAdminDetailDto;
import com.company.furniturecatalog.dto.admin.response.ProductAdminListItemDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.publicapi.BreadcrumbDto;
import com.company.furniturecatalog.dto.publicapi.ProductCardDto;
import com.company.furniturecatalog.dto.publicapi.ProductDetailDto;
import com.company.furniturecatalog.dto.publicapi.WhatsAppInquiryDto;
import com.company.furniturecatalog.exception.ConflictException;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.CategoryMapper;
import com.company.furniturecatalog.mapper.ProductMapper;
import com.company.furniturecatalog.mapper.ProductVariationImageMapper;
import com.company.furniturecatalog.mapper.ProductVariationMapper;
import com.company.furniturecatalog.repository.CategoryRepository;
import com.company.furniturecatalog.repository.ProductRepository;
import com.company.furniturecatalog.repository.ProductVariationRepository;
import com.company.furniturecatalog.repository.SiteSettingRepository;
import com.company.furniturecatalog.repository.spec.ProductSpecifications;
import com.company.furniturecatalog.service.ProductService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import com.company.furniturecatalog.util.WhatsAppInquiryBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;
    private final CategoryRepository categoryRepository;
    private final SiteSettingRepository siteSettingRepository;

    private final ProductMapper productMapper;
    private final ProductVariationMapper variationMapper;
    private final ProductVariationImageMapper imageMapper;
    private final CategoryMapper categoryMapper;

    private final StorageUrlResolver urlResolver;
    private final WhatsAppInquiryBuilder whatsappBuilder;

    // ================================================================
    // Admin writes
    // ================================================================

    @Override
    public ProductAdminDetailDto create(CreateProductRequest r) {
        if (productRepository.existsBySlugAndDeletedAtIsNull(r.slug())) {
            throw new ConflictException("Slug '" + r.slug() + "' is already in use");
        }
        if (productRepository.existsBySkuAndDeletedAtIsNull(r.sku())) {
            throw new ConflictException("SKU '" + r.sku() + "' is already in use");
        }

        Category category = categoryRepository.findByIdAndDeletedAtIsNull(r.categoryId())
                .orElseThrow(() -> NotFoundException.of("Category", r.categoryId()));

        Product product = productMapper.toEntity(r);
        product.setCategory(category);

        if (product.getStatus() == ProductStatus.PUBLISHED && product.getPublishedAt() == null) {
            product.setPublishedAt(OffsetDateTime.now());
        }

        Product saved = productRepository.save(product);
        log.info("Created product {} (sku={}, slug={})", saved.getId(), saved.getSku(), saved.getSlug());
        return productMapper.toAdminDetail(saved, urlResolver, variationMapper, imageMapper);
    }

    @Override
    public ProductAdminDetailDto update(UUID id, UpdateProductRequest r) {
        Product product = loadLive(id);

        if (r.categoryId() != null
                && (product.getCategory() == null || !r.categoryId().equals(product.getCategory().getId()))) {
            Category category = categoryRepository.findByIdAndDeletedAtIsNull(r.categoryId())
                    .orElseThrow(() -> NotFoundException.of("Category", r.categoryId()));
            product.setCategory(category);
        }

        if (r.slug() != null && !r.slug().equals(product.getSlug())
                && productRepository.existsBySlugAndDeletedAtIsNull(r.slug())) {
            throw new ConflictException("Slug '" + r.slug() + "' is already in use");
        }
        if (r.sku() != null && !r.sku().equals(product.getSku())
                && productRepository.existsBySkuAndDeletedAtIsNull(r.sku())) {
            throw new ConflictException("SKU '" + r.sku() + "' is already in use");
        }

        ProductStatus previous = product.getStatus();
        productMapper.updateEntity(r, product);

        // DRAFT -> PUBLISHED stamps publishedAt the first time it goes live.
        if (product.getStatus() == ProductStatus.PUBLISHED
                && previous != ProductStatus.PUBLISHED
                && product.getPublishedAt() == null) {
            product.setPublishedAt(OffsetDateTime.now());
        }

        return productMapper.toAdminDetail(product, urlResolver, variationMapper, imageMapper);
    }

    @Override
    public void delete(UUID id) {
        Product product = loadLive(id);
        product.markDeleted();
        log.info("Soft-deleted product {}", id);
    }

    // ================================================================
    // Admin reads
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public ProductAdminDetailDto getAdmin(UUID id) {
        Product product = productRepository.findWithVariationsByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> NotFoundException.of("Product", id));
        return productMapper.toAdminDetail(product, urlResolver, variationMapper, imageMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductAdminListItemDto> searchAdmin(String query,
                                                             UUID categoryId,
                                                             boolean subtree,
                                                             ProductStatus status,
                                                             Boolean featured,
                                                             Pageable pageable) {
        Set<UUID> categoryIds = resolveCategoryIds(categoryId, subtree);

        Specification<Product> spec = Specification
                .where(ProductSpecifications.notDeleted())
                .and(ProductSpecifications.hasStatus(status))
                .and(ProductSpecifications.featuredOnly(featured))
                .and(ProductSpecifications.inCategories(categoryIds))
                .and(ProductSpecifications.query(query));

        Page<Product> page = productRepository.findAll(spec, pageable);
        Map<UUID, List<ProductVariation>> variationsByProduct = loadVariationsForPage(page.getContent());

        List<ProductAdminListItemDto> items = page.getContent().stream()
                .map(p -> toAdminListItem(p, variationsByProduct.get(p.getId())))
                .toList();
        return PageResponse.of(page, items);
    }

    /**
     * Mapper stays pure; the cover-image resolution works off the already-loaded
     * variation list so we keep 2 queries total (page + bulk variations).
     */
    private ProductAdminListItemDto toAdminListItem(Product p, List<ProductVariation> variations) {
        String coverUrl = pickCoverUrl(variations);
        ProductAdminListItemDto dto = productMapper.toAdminListItem(p, urlResolver);
        return new ProductAdminListItemDto(
                dto.id(), dto.sku(), dto.slug(), dto.name(), dto.brand(),
                dto.categoryId(), dto.categoryName(),
                dto.status(), dto.featured(), dto.sortOrder(),
                variations == null ? 0 : variations.size(),
                coverUrl != null ? coverUrl : dto.coverImageUrl(),
                dto.updatedAt()
        );
    }

    // ================================================================
    // Public listing
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductCardDto> listPublic(UUID categoryId,
                                                   boolean subtree,
                                                   String query,
                                                   Boolean featured,
                                                   Pageable pageable) {
        Set<UUID> categoryIds = resolveCategoryIds(categoryId, subtree);

        Specification<Product> spec = Specification
                .where(ProductSpecifications.notDeleted())
                .and(ProductSpecifications.hasStatus(ProductStatus.PUBLISHED))
                .and(ProductSpecifications.featuredOnly(featured))
                .and(ProductSpecifications.inCategories(categoryIds))
                .and(ProductSpecifications.publicQuery(query));

        Page<Product> page = productRepository.findAll(spec, pageable);
        Map<UUID, List<ProductVariation>> variationsByProduct = loadVariationsForPage(page.getContent());

        List<ProductCardDto> cards = page.getContent().stream()
                .map(p -> toCard(p, variationsByProduct.get(p.getId())))
                .toList();
        return PageResponse.of(page, cards);
    }

    private ProductCardDto toCard(Product p, List<ProductVariation> variations) {
        String coverUrl = pickCoverUrl(variations);
        List<String> colors = variations == null ? List.of() : variations.stream()
                .sorted(Comparator.comparingInt(ProductVariation::getSortOrder))
                .map(ProductVariation::getColorHex)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .toList();
        return productMapper.toCard(p, coverUrl, colors);
    }

    /** Default variation's primary image wins; otherwise the first variation's primary image. */
    private String pickCoverUrl(List<ProductVariation> variations) {
        if (variations == null || variations.isEmpty()) return null;
        ProductVariation chosen = variations.stream()
                .filter(ProductVariation::isDefaultVariation)
                .findFirst()
                .orElse(variations.get(0));
        return chosen.getPrimaryImage() == null
                ? null
                : urlResolver.publicUrl(chosen.getPrimaryImage().getStorageKey());
    }

    /** Bulk-load variations+primaryImage for a page (second query avoids N+1). */
    private Map<UUID, List<ProductVariation>> loadVariationsForPage(List<Product> products) {
        if (products == null || products.isEmpty()) return Map.of();
        List<UUID> ids = products.stream().map(Product::getId).toList();
        return variationRepository.findForProducts(ids).stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId()));
    }

    // ================================================================
    // Public detail
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getPublicDetail(String slug) {
        Product product = productRepository.findWithVariationsBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> NotFoundException.of("Product", slug));

        // Don't leak draft/archived products on public endpoints.
        if (product.getStatus() != ProductStatus.PUBLISHED) {
            throw NotFoundException.of("Product", slug);
        }

        List<BreadcrumbDto> breadcrumbs = productMapper.breadcrumbsOf(product, categoryMapper);

        List<ProductVariation> sorted = new ArrayList<>(product.getVariations());
        sorted.sort(Comparator.comparingInt(ProductVariation::getSortOrder));

        ProductVariation defaultVariation = sorted.stream()
                .filter(ProductVariation::isDefaultVariation)
                .findFirst()
                .orElseGet(() -> sorted.isEmpty() ? null : sorted.get(0));

        UUID defaultVariationId = defaultVariation == null ? null : defaultVariation.getId();

        WhatsAppInquiryDto inquiry = buildWhatsAppInquiry(product, defaultVariation);

        return productMapper.toDetailDto(
                product,
                breadcrumbs,
                defaultVariationId,
                inquiry,
                urlResolver,
                variationMapper,
                imageMapper
        );
    }

    private WhatsAppInquiryDto buildWhatsAppInquiry(Product product, ProductVariation defaultVariation) {
        String phone    = readStringSetting("whatsapp.number");
        if (phone == null || phone.isBlank()) return null;
        String template = readStringSetting("whatsapp.message_template");
        String baseUrl  = readStringSetting("site.public_base_url");
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "";
        } else if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String productUrl = baseUrl + "/product/" + product.getSlug();
        return whatsappBuilder.build(phone, template, product, defaultVariation, productUrl);
    }

    private String readStringSetting(String key) {
        return siteSettingRepository.findById(key)
                .map(SiteSetting::getValue)
                .map(v -> v instanceof String s ? s : v.toString())
                .orElse(null);
    }

    // ================================================================
    // Shared helpers
    // ================================================================

    private Product loadLive(UUID id) {
        return productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> NotFoundException.of("Product", id));
    }

    private Set<UUID> resolveCategoryIds(UUID categoryId, boolean subtree) {
        if (categoryId == null) return null;
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> NotFoundException.of("Category", categoryId));
        if (!subtree) {
            return Set.of(categoryId);
        }
        String path = category.getPath();
        if (path == null || path.isBlank()) {
            return Set.of(categoryId);
        }
        List<UUID> ids = categoryRepository.findDescendantIdsByPath(path);
        if (ids.isEmpty()) return Set.of(categoryId);
        return new java.util.HashSet<>(ids);
    }
}
