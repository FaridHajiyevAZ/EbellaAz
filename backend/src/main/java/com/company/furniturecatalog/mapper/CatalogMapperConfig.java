package com.company.furniturecatalog.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Shared MapStruct config:
 *  - Spring component model
 *  - IGNORE unmapped targets
 *  - Null sources are skipped (matches PATCH-style update semantics)
 */
@MapperConfig(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CatalogMapperConfig {
}
