package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, String> {

    List<SiteSetting> findByPublicSettingTrue();
}
