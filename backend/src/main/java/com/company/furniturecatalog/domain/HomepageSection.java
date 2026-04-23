package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.domain.enums.HomeSectionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
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
        name = "home_sections",
        indexes = {
                @Index(name = "idx_home_sections_sort", columnList = "sort_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class HomepageSection extends SoftDeletableEntity {

    @ToString.Include
    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 40)
    private HomeSectionType sectionType;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "subtitle", length = 400)
    private String subtitle;

    /** Type-specific options (product ids to feature, category ids, image keys, ...). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config = new LinkedHashMap<>();

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ContentStatus status = ContentStatus.PUBLISHED;
}
