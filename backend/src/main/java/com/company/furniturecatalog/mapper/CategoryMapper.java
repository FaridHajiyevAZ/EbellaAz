package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.dto.admin.request.CreateCategoryRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateCategoryRequest;
import com.company.furniturecatalog.dto.admin.response.CategoryAdminDto;
import com.company.furniturecatalog.dto.publicapi.BreadcrumbDto;
import com.company.furniturecatalog.dto.publicapi.CategorySummaryDto;
import com.company.furniturecatalog.dto.publicapi.CategoryTreeNodeDto;
import com.company.furniturecatalog.util.StorageUrlResolver;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = CatalogMapperConfig.class, uses = StorageUrlResolver.class)
public interface CategoryMapper {

    // --- Entity creation / updates --------------------------------------

    @Mapping(target = "parent",   ignore = true)   // set explicitly in service
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "path",     ignore = true)   // materialised by service
    @Mapping(target = "depth",    ignore = true)
    Category toEntity(CreateCategoryRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "name",            source = "name")
    @Mapping(target = "slug",            source = "slug")
    @Mapping(target = "description",     source = "description")
    @Mapping(target = "coverImageKey",   source = "coverImageKey")
    @Mapping(target = "sortOrder",       source = "sortOrder")
    @Mapping(target = "status",          source = "status")
    @Mapping(target = "metaTitle",       source = "metaTitle")
    @Mapping(target = "metaDescription", source = "metaDescription")
    void updateEntity(UpdateCategoryRequest request, @MappingTarget Category entity);

    // --- Public responses -----------------------------------------------

    @Mapping(target = "fullPath",        expression = "java(buildFullPath(category))")
    @Mapping(target = "coverImageUrl",   expression = "java(urlResolver.publicUrl(category.getCoverImageKey()))")
    CategorySummaryDto toSummary(Category category, StorageUrlResolver urlResolver);

    @Mapping(target = "fullPath",        expression = "java(buildFullPath(category))")
    BreadcrumbDto toBreadcrumb(Category category);

    /**
     * Single-node conversion for tree assembly. The tree shape itself is built
     * in {@link com.company.furniturecatalog.service.CategoryService} (or equivalent)
     * because nesting is not a field-by-field mapping MapStruct can generate.
     */
    @Mapping(target = "fullPath",        expression = "java(buildFullPath(category))")
    @Mapping(target = "children",        ignore = true)
    CategoryTreeNodeDto toTreeNode(Category category);

    // --- Admin responses ------------------------------------------------

    @Mapping(target = "parentId",        source = "category.parent.id")
    @Mapping(target = "coverImageUrl",   expression = "java(urlResolver.publicUrl(category.getCoverImageKey()))")
    CategoryAdminDto toAdminDto(Category category, StorageUrlResolver urlResolver);

    // --- Helpers available to generated code ---------------------------

    default String buildFullPath(Category category) {
        if (category == null || category.getSlug() == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder(category.getSlug());
        Category cursor = category.getParent();
        while (cursor != null && cursor.getSlug() != null) {
            sb.insert(0, cursor.getSlug() + "/");
            cursor = cursor.getParent();
        }
        return "/" + sb;
    }
}
