package com.company.furniturecatalog;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FurnitureCatalogApplicationTests {

    @Test
    void contextLoads() {
        // Boots the full application context with the test profile.
    }
}
