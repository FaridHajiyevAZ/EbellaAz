package com.company.furniturecatalog.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI furnitureCatalogOpenAPI(
            @Value("${spring.application.name}") String appName,
            @Value("${api.base-path:/api/v1}") String basePath
    ) {
        return new OpenAPI()
                .info(new Info()
                        .title(appName + " API")
                        .description("REST API for the Furniture Catalog Website (public + admin).")
                        .version("v1")
                        .contact(new Contact().name("Ebella").email("dev@ebella.az"))
                        .license(new License().name("Proprietary")))
                .servers(List.of(
                        new Server().url(basePath).description("Current server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste the JWT access token.")));
    }
}
