package com.company.furniturecatalog.service;

import com.company.furniturecatalog.domain.enums.ProductStatus;
import com.company.furniturecatalog.dto.admin.request.CreateProductRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateProductRequest;
import com.company.furniturecatalog.dto.admin.response.ProductAdminDetailDto;
import com.company.furniturecatalog.dto.admin.response.ProductAdminListItemDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.publicapi.ProductCardDto;
import com.company.furniturecatalog.dto.publicapi.ProductDetailDto;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProductService {

    // ---- Admin ---------------------------------------------------------

    ProductAdminDetailDto create(CreateProductRequest request);

    ProductAdminDetailDto update(UUID id, UpdateProductRequest request);

    void delete(UUID id);

    ProductAdminDetailDto getAdmin(UUID id);

    PageResponse<ProductAdminListItemDto> searchAdmin(String query,
                                                      UUID categoryId,
                                                      boolean subtree,
                                                      ProductStatus status,
                                                      Boolean featured,
                                                      Pageable pageable);

    // ---- Public --------------------------------------------------------

    PageResponse<ProductCardDto> listPublic(UUID categoryId,
                                            boolean subtree,
                                            String query,
                                            Boolean featured,
                                            Pageable pageable);

    ProductDetailDto getPublicDetail(String slug);
}
