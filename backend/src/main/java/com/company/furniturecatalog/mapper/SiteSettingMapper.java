package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.SiteSetting;
import com.company.furniturecatalog.dto.admin.response.SiteSettingAdminDto;
import com.company.furniturecatalog.dto.publicapi.SiteSettingPublicDto;
import org.mapstruct.Mapper;

@Mapper(config = CatalogMapperConfig.class)
public interface SiteSettingMapper {

    SiteSettingPublicDto toPublicDto(SiteSetting setting);

    SiteSettingAdminDto toAdminDto(SiteSetting setting);
}
