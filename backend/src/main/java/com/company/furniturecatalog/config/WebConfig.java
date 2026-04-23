package com.company.furniturecatalog.config;

import com.company.furniturecatalog.config.properties.CorsProperties;
import com.company.furniturecatalog.config.properties.StorageProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Centralises MVC wiring:
 *  - Applies the global /api/v1 prefix to every @RestController
 *  - Registers CORS rules driven by CorsProperties
 *  - Exposes the local upload directory as static resources
 *  - Serves the bundled React SPA from classpath:/static/ and falls back to
 *    index.html for unknown paths so React Router deep links survive a refresh
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
        // --- Uploaded media (local storage provider) ---
        if (storageProperties.provider() == StorageProperties.Provider.LOCAL) {
            StorageProperties.Local local = storageProperties.local();
            Path root = Paths.get(local.rootPath()).toAbsolutePath().normalize();
            String urlPath = local.urlPath() == null ? "/media" : local.urlPath();
            registry.addResourceHandler(urlPath + "/**")
                    .addResourceLocations(root.toUri().toString())
                    .setCachePeriod(3600);
        }

        // --- SPA fallback ---
        // Serves the bundled frontend at /. When a requested file doesn't
        // exist, returns index.html so React Router can handle deep links
        // like /category/home-furniture. API, media, actuator, and OpenAPI
        // paths are explicitly excluded so they never 200 with index.html.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());
    }

    /**
     * Resolver that hunts for a real static file first and falls back to
     * index.html when the path is a SPA route.
     */
    private static final class SpaResourceResolver extends PathResourceResolver {
        private static final String[] NON_SPA_PREFIXES = {
                "api/", "media/", "actuator/", "v3/api-docs", "swagger-ui",
        };

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) {
                return requested;
            }
            for (String p : NON_SPA_PREFIXES) {
                if (resourcePath.startsWith(p)) return null;
            }
            Resource index = new ClassPathResource("/static/index.html");
            return index.exists() ? index : null;
        }
    }

    private static String[] toArray(List<String> list) {
        return list == null ? new String[0] : list.toArray(String[]::new);
    }
}
