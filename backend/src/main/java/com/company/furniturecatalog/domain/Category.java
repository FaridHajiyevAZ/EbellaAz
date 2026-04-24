package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
        name = "categories",
        indexes = {
                @Index(name = "idx_categories_parent_id", columnList = "parent_id"),
                @Index(name = "idx_categories_status",     columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class Category extends SoftDeletableEntity {

    @ToString.Include
    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @ToString.Include
    @Column(name = "slug", nullable = false, length = 160)
    private String slug;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "cover_image_key", columnDefinition = "text")
    private String coverImageKey;

    /** Materialised ltree path; populated by service/trigger, not by JPA. */
    @Column(name = "path", columnDefinition = "ltree")
    private String path;

    @Column(name = "depth", nullable = false)
    private short depth = 0;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ContentStatus status = ContentStatus.PUBLISHED;

    @Column(name = "meta_title", length = 180)
    private String metaTitle;

    @Column(name = "meta_description", length = 320)
    private String metaDescription;

    // --- Self-referential tree ------------------------------------------

    /**
     * Parent category. LAZY to avoid walking the tree on every load;
     * JsonIgnore guards against any accidental direct serialization.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @ToString.Exclude
    private Category parent;

    /**
     * Children are LAZY. Not cascaded: deleting/moving children is an
     * explicit service operation. Filtered to hide soft-deleted rows.
     */
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @SQLRestriction("deleted_at IS NULL")
    @ToString.Exclude
    private List<Category> children = new ArrayList<>();

    // --- Helpers --------------------------------------------------------

    public void addChild(Category child) {
        children.add(child);
        child.setParent(this);
        child.setDepth((short) (this.depth + 1));
    }

    public void removeChild(Category child) {
        children.remove(child);
        child.setParent(null);
    }

    public boolean isRoot() {
        return parent == null;
    }
}
