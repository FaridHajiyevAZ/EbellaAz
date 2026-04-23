package com.company.furniturecatalog;

import com.company.furniturecatalog.config.properties.CorsProperties;
import com.company.furniturecatalog.config.properties.JwtProperties;
import com.company.furniturecatalog.config.properties.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackageClasses = {
        CorsProperties.class,
        StorageProperties.class,
        JwtProperties.class
})
public class FurnitureCatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(FurnitureCatalogApplication.class, args);
    }
}
