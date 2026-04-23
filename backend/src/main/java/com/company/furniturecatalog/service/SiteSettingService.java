package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.UpsertSiteSettingRequest;
import com.company.furniturecatalog.dto.admin.response.SiteSettingAdminDto;

import java.util.List;
import java.util.Map;

public interface SiteSettingService {

    List<SiteSettingAdminDto> listAdmin();

    SiteSettingAdminDto getAdmin(String key);

    SiteSettingAdminDto upsert(String key, UpsertSiteSettingRequest request);

    void delete(String key);

    /** Key/value map of public settings, ready for the React app's global store. */
    Map<String, Object> getPublicBundle();
}
