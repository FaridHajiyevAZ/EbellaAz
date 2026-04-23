package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.ProductStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_category_id", columnList = "category_id"),
                @Index(name = "idx_products_status",      columnList = "status"),
                @Index(name = "idx_products_featured",    columnList = "is_featured, sort_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class Product extends SoftDeletableEntity {

    /**
     * Products reference but do not cascade to categories — moving/deleting
     * a category is an explicit admin action (RESTRICT at DB level).
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    private Category category;

    @ToString.Include
    @Column(name = "sku", nullable = false, length = 64)
    private String sku;

    @ToString.Include
    @Column(name = "slug", nullable = false, length = 200)
    private String slug;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "brand", length = 120)
    private String brand;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "text")
    private String longDescription;

    /** e.g. {"width_cm":180,"depth_cm":90,"height_cm":75,"weight_kg":42}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions", columnDefinition = "jsonb")
    private Map<String, Object> dimensions;

    /** Stored as PostgreSQL text[]. */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "materials", columnDefinition = "text[]", nullable = false)
    private List<String> materials = new ArrayList<>();

    /** Per-category flexible fields (firmness, drawers, warranty, ...). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> specs = new LinkedHashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "meta_title", length = 180)
    private String metaTitle;

    @Column(name = "meta_description", length = 320)
    private String metaDescription;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    /**
     * Variations fully belong to the product lifecycle:
     *  - CascadeType.ALL + orphanRemoval so removing a variation from the list
     *    triggers DELETE, and deleting a product wipes the collection.
     *  - LAZY fetch; product detail queries fetch via JPQL/entity graph.
     */
    @OneToMany(mappedBy = "product",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, id ASC")
    @SQLRestriction("deleted_at IS NULL")
    @ToString.Exclude
    private List<ProductVariation> variations = new ArrayList<>();

    // --- Helpers --------------------------------------------------------

    public void addVariation(ProductVariation variation) {
        variations.add(variation);
        variation.setProduct(this);
    }

    public void removeVariation(ProductVariation variation) {
        variations.remove(variation);
        variation.setProduct(null);
    }
}
