package com.company.furniturecatalog.config;

import com.company.furniturecatalog.config.properties.CorsProperties;
import com.company.furniturecatalog.config.properties.StorageProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Centralises MVC wiring:
 *  - Applies the global /api/v1 prefix to every @RestController
 *  - Registers CORS rules driven by CorsProperties
 *  - Exposes the local upload directory as static resources
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;
    private final StorageProperties storageProperties;
    private final String apiBasePath;

    public WebConfig(CorsProperties corsProperties,
                     StorageProperties storageProperties,
                     @Value("${api.base-path:/api/v1}") String apiBasePath) {
        this.corsProperties = corsProperties;
        this.storageProperties = storageProperties;
        this.apiBasePath = apiBasePath;
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(apiBasePath, c -> c.isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(apiBasePath + "/**")
                .allowedOrigins(toArray(corsProperties.allowedOrigins()))
                .allowedMethods(toArray(corsProperties.allowedMethods()))
                .allowedHeaders(toArray(corsProperties.allowedHeaders()))
                .exposedHeaders(toArray(corsProperties.exposedHeaders()))
                .allowCredentials(corsProperties.allowCredentials())
                .maxAge(corsProperties.maxAge());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (storageProperties.provider() == StorageProperties.Provider.LOCAL) {
            StorageProperties.Local local = storageProperties.local();
            Path root = Paths.get(local.rootPath()).toAbsolutePath().normalize();
            String urlPath = local.urlPath() == null ? "/media" : local.urlPath();
            registry.addResourceHandler(urlPath + "/**")
                    .addResourceLocations(root.toUri().toString())
                    .setCachePeriod(3600);
        }
    }

    private static String[] toArray(List<String> list) {
        return list == null ? new String[0] : list.toArray(String[]::new);
    }
}
