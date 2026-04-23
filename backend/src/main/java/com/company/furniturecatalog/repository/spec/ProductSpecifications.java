package com.company.furniturecatalog.repository.spec;

import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.enums.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.UUID;

/**
 * Composable filters for {@link Product} listings. Used by both the admin
 * table and the public product grid.
 */
public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> notDeleted() {
        return (root, q, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Product> hasStatus(ProductStatus status) {
        return status == null ? null : (root, q, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Product> featuredOnly(Boolean featured) {
        return featured == null ? null : (root, q, cb) -> cb.equal(root.get("featured"), featured);
    }

    public static Specification<Product> inCategories(Collection<UUID> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return null;
        return (root, q, cb) -> root.get("category").get("id").in(categoryIds);
    }

    /** Case-insensitive match on name, sku, or slug. */
    public static Specification<Product> query(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.trim().toLowerCase() + "%";
        return (root, q, cb) -> {
            Predicate byName = cb.like(cb.lower(root.get("name")), like);
            Predicate bySku  = cb.like(cb.lower(root.get("sku")),  like);
            Predicate bySlug = cb.like(cb.lower(root.get("slug")), like);
            return cb.or(byName, bySku, bySlug);
        };
    }

    /** Narrower "public search" — only name matters for customers. */
    public static Specification<Product> publicQuery(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.trim().toLowerCase() + "%";
        return (root, q, cb) -> cb.like(cb.lower(root.get("name")), like);
    }
}
