package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.VariationStatus;
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
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "product_variations",
        indexes = {
                @Index(name = "idx_variations_product_id", columnList = "product_id"),
                @Index(name = "idx_variations_product_sort", columnList = "product_id, sort_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class ProductVariation extends SoftDeletableEntity {

    /**
     * Owning side. LAZY; @JsonIgnore breaks any accidental serialization cycle
     * (DTOs never expose the full entity graph anyway).
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    private Product product;

    @ToString.Include
    @Column(name = "color_name", nullable = false, length = 80)
    private String colorName;

    @Column(name = "color_hex", nullable = false, length = 7)
    private String colorHex;

    @Column(name = "variation_sku", length = 64)
    private String variationSku;

    @Column(name = "stock_status_text", nullable = false, length = 80)
    private String stockStatusText = "In stock";

    /** Exactly one variation per product should have this set to true. */
    @Column(name = "is_default", nullable = false)
    private boolean defaultVariation = false;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private VariationStatus status = VariationStatus.ACTIVE;

    /**
     * Primary image of this variation. Optional, nullable; the DB FK is
     * deferrable so inserts can happen in any order. Image lifecycle is owned
     * by the images collection, so no cascade on this reference.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_image_id")
    @ToString.Exclude
    private ProductVariationImage primaryImage;

    /**
     * Gallery. CascadeType.ALL + orphanRemoval: variation owns its images.
     */
    @OneToMany(mappedBy = "variation",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, id ASC")
    @SQLRestriction("deleted_at IS NULL")
    @ToString.Exclude
    private List<ProductVariationImage> images = new ArrayList<>();

    // --- Helpers --------------------------------------------------------

    public void addImage(ProductVariationImage image) {
        images.add(image);
        image.setVariation(this);
    }

    public void removeImage(ProductVariationImage image) {
        images.remove(image);
        image.setVariation(null);
        if (image.equals(this.primaryImage)) {
            this.primaryImage = null;
        }
    }
}
