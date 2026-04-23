package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.dto.admin.request.CreateCategoryRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateCategoryRequest;
import com.company.furniturecatalog.dto.admin.response.CategoryAdminDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.CategoryTreeNodeDto;
import com.company.furniturecatalog.exception.BadRequestException;
import com.company.furniturecatalog.exception.ConflictException;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.CategoryMapper;
import com.company.furniturecatalog.repository.CategoryRepository;
import com.company.furniturecatalog.repository.ProductRepository;
import com.company.furniturecatalog.service.CategoryService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;
    private final StorageUrlResolver urlResolver;

    // ================================================================
    // Admin writes
    // ================================================================

    @Override
    public CategoryAdminDto create(CreateCategoryRequest request) {
        Category parent = resolveParent(request.parentId());
        assertSlugAvailable(request.slug(), parent);

        Category category = categoryMapper.toEntity(request);
        category.setParent(parent);
        applyPathAndDepth(category, parent);

        Category saved = categoryRepository.save(category);
        log.info("Created category {} (slug={}) under parent={}",
                saved.getId(), saved.getSlug(), parent == null ? "ROOT" : parent.getId());
        return categoryMapper.toAdminDto(saved, urlResolver);
    }

    @Override
    public CategoryAdminDto update(UUID id, UpdateCategoryRequest request) {
        Category category = loadLive(id);

        // Parent change (null is valid: moving to root)
        boolean parentChanged = request.parentId() != null
                ? !equalsOrNull(request.parentId(), idOf(category.getParent()))
                : false;

        if (parentChanged) {
            assertNotCircular(category, request.parentId());
            Category newParent = resolveParent(request.parentId());
            category.setParent(newParent);
        }

        // Apply scalar fields from PATCH-style request
        categoryMapper.updateEntity(request, category);

        // Slug change (or parent change) requires fresh uniqueness check
        if (request.slug() != null || parentChanged) {
            assertSlugAvailableForExisting(category);
        }

        // Any parent-or-slug change recomputes the subtree path/depth
        if (parentChanged || request.slug() != null) {
            recomputePathAndDepthRecursive(category);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toAdminDto(saved, urlResolver);
    }

    @Override
    public void delete(UUID id, UUID reassignTo) {
        Category category = loadLive(id);

        if (categoryRepository.existsByParentIdAndDeletedAtIsNull(id)) {
            throw new ConflictException(
                    "Category has subcategories. Move or delete them before removing this category.");
        }

        long productCount = productRepository.countByCategoryIdAndDeletedAtIsNull(id);
        if (productCount > 0) {
            if (reassignTo == null) {
                throw new ConflictException(
                        "Category has %d product(s). Pass reassignTo=<categoryId> to move them before deletion."
                                .formatted(productCount));
            }
            if (reassignTo.equals(id)) {
                throw new BadRequestException("reassignTo cannot equal the category being deleted");
            }
            Category target = loadLive(reassignTo);
            int moved = productRepository.reassignCategory(id, target);
            log.info("Reassigned {} products from category {} to {}", moved, id, target.getId());
        }

        category.markDeleted();
        log.info("Soft-deleted category {}", id);
    }

    @Override
    public void reorder(UUID parentId, ReorderRequest request) {
        Map<UUID, Integer> newOrder = new HashMap<>();
        for (ReorderRequest.Item item : request.items()) {
            newOrder.put(item.id(), item.sortOrder());
        }

        List<Category> siblings = parentId == null
                ? categoryRepository.findByParentIsNullAndDeletedAtIsNullOrderBySortOrderAsc()
                : categoryRepository.findByParentIdAndDeletedAtIsNullOrderBySortOrderAsc(parentId);

        for (Category c : siblings) {
            Integer order = newOrder.get(c.getId());
            if (order != null) {
                c.setSortOrder(order);
            }
        }
        // Save is implicit via dirty checking within the transaction.
    }

    // ================================================================
    // Admin reads
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public CategoryAdminDto get(UUID id) {
        return categoryMapper.toAdminDto(loadLive(id), urlResolver);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryAdminDto> search(String query,
                                                 UUID parentId,
                                                 boolean onlyRoots,
                                                 ContentStatus status,
                                                 Pageable pageable) {
        if (parentId != null && onlyRoots) {
            throw new BadRequestException("parentId and onlyRoots are mutually exclusive");
        }
        Page<Category> page = categoryRepository.search(query, parentId, onlyRoots, status, pageable);
        List<CategoryAdminDto> mapped = page.getContent().stream()
                .map(c -> categoryMapper.toAdminDto(c, urlResolver))
                .toList();
        return PageResponse.of(page, mapped);
    }

    // ================================================================
    // Public tree
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public List<CategoryTreeNodeDto> getPublicTree() {
        List<Category> flat = categoryRepository.findAllLiveByStatus(ContentStatus.PUBLISHED);
        return buildTree(flat);
    }

    private List<CategoryTreeNodeDto> buildTree(List<Category> flat) {
        Map<UUID, List<Category>> byParent = new HashMap<>();
        List<Category> roots = new ArrayList<>();
        for (Category c : flat) {
            if (c.getParent() == null) {
                roots.add(c);
            } else {
                byParent.computeIfAbsent(c.getParent().getId(), k -> new ArrayList<>()).add(c);
            }
        }
        Comparator<Category> ordering = Comparator
                .comparingInt(Category::getSortOrder)
                .thenComparing(Category::getName, Comparator.nullsLast(String::compareTo));
        roots.sort(ordering);
        byParent.values().forEach(list -> list.sort(ordering));

        List<CategoryTreeNodeDto> out = new ArrayList<>(roots.size());
        for (Category r : roots) {
            out.add(assemble(r, byParent));
        }
        return out;
    }

    private CategoryTreeNodeDto assemble(Category node, Map<UUID, List<Category>> byParent) {
        List<Category> kids = byParent.getOrDefault(node.getId(), List.of());
        List<CategoryTreeNodeDto> childDtos = new ArrayList<>(kids.size());
        for (Category k : kids) {
            childDtos.add(assemble(k, byParent));
        }
        CategoryTreeNodeDto base = categoryMapper.toTreeNode(node);
        return new CategoryTreeNodeDto(
                base.id(), base.name(), base.slug(), base.fullPath(),
                base.depth(), base.sortOrder(), childDtos
        );
    }

    // ================================================================
    // Business rule helpers
    // ================================================================

    private Category loadLive(UUID id) {
        return categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> NotFoundException.of("Category", id));
    }

    private Category resolveParent(UUID parentId) {
        if (parentId == null) return null;
        return loadLive(parentId);
    }

    private void assertSlugAvailable(String slug, Category parent) {
        boolean taken = parent == null
                ? categoryRepository.existsBySlugAndParentIsNullAndDeletedAtIsNull(slug)
                : categoryRepository.existsBySlugAndParentIdAndDeletedAtIsNull(slug, parent.getId());
        if (taken) {
            throw new ConflictException("Slug '" + slug + "' is already used at this level");
        }
    }

    /** Variant that permits the same slug when it's unchanged on the same row. */
    private void assertSlugAvailableForExisting(Category category) {
        String slug = category.getSlug();
        UUID parentId = idOf(category.getParent());
        var existing = parentId == null
                ? categoryRepository.findBySlugAndParentIsNullAndDeletedAtIsNull(slug)
                : categoryRepository.findBySlugAndParentIdAndDeletedAtIsNull(slug, parentId);
        existing.filter(c -> !c.getId().equals(category.getId())).ifPresent(c -> {
            throw new ConflictException("Slug '" + slug + "' is already used at this level");
        });
    }

    private void assertNotCircular(Category self, UUID newParentId) {
        if (newParentId == null) return;
        if (newParentId.equals(self.getId())) {
            throw new BadRequestException("A category cannot be its own parent");
        }
        Category cursor = loadLive(newParentId);
        while (cursor != null) {
            if (cursor.getId().equals(self.getId())) {
                throw new BadRequestException("Cannot move a category into its own subtree");
            }
            cursor = cursor.getParent();
        }
    }

    /** Ltree segments use underscores, not hyphens: sofas-corner → sofas_corner. */
    private static String ltreeSegment(String slug) {
        return slug == null ? "" : slug.replace('-', '_');
    }

    private static void applyPathAndDepth(Category node, Category parent) {
        String segment = ltreeSegment(node.getSlug());
        if (parent == null) {
            node.setPath(segment);
            node.setDepth((short) 0);
        } else {
            String parentPath = parent.getPath() == null ? "" : parent.getPath();
            node.setPath(parentPath.isEmpty() ? segment : parentPath + "." + segment);
            node.setDepth((short) (parent.getDepth() + 1));
        }
    }

    /** Recomputes path/depth for this node and its entire live subtree. */
    private void recomputePathAndDepthRecursive(Category node) {
        applyPathAndDepth(node, node.getParent());
        for (Category child : node.getChildren()) {
            recomputePathAndDepthRecursive(child);
        }
    }

    private static UUID idOf(Category c) {
        return c == null ? null : c.getId();
    }

    private static boolean equalsOrNull(UUID a, UUID b) {
        return a == null ? b == null : a.equals(b);
    }
}
