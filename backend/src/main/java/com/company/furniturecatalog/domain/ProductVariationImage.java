package com.company.furniturecatalog.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(
        name = "variation_images",
        indexes = {
                @Index(name = "idx_variation_images_variation_id", columnList = "variation_id, sort_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class ProductVariationImage extends SoftDeletableEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variation_id", nullable = false)
    @ToString.Exclude
    private ProductVariation variation;

    /** Storage-backend-agnostic key, e.g. 'products/2026/04/<uuid>.jpg'. */
    @ToString.Include
    @Column(name = "storage_key", nullable = false, unique = true, columnDefinition = "text")
    private String storageKey;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "content_type", length = 80)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    /** Generated renditions map, e.g. {"sm":"...","md":"...","lg":"...","webp":"..."}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "renditions", columnDefinition = "jsonb", nullable = false)
    private Map<String, String> renditions = new LinkedHashMap<>();

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;
}
