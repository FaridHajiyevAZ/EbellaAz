package com.company.furniturecatalog.storage;

import com.company.furniturecatalog.config.properties.StorageProperties;
import com.company.furniturecatalog.util.StorageUrlResolver;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Local-filesystem implementation of {@link StorageService}.
 *
 * Selected when {@code app.storage.provider=local} (the default). A future
 * S3StorageService would live alongside this one and be activated via
 * {@code app.storage.provider=s3}.
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path rootPath;
    private final StorageUrlResolver urlResolver;

    public LocalStorageService(StorageProperties properties, StorageUrlResolver urlResolver) {
        this.rootPath = Paths.get(properties.local().rootPath()).toAbsolutePath().normalize();
        this.urlResolver = urlResolver;
    }

    @PostConstruct
    void ensureRoot() throws IOException {
        Files.createDirectories(rootPath);
        log.info("Local storage initialised at {}", rootPath);
    }

    @Override
    public StoredFile store(MultipartFile file, List<String> pathSegments) {
        String original = file.getOriginalFilename();
        String extension = sanitiseExtension(FileValidator.extensionOf(original));
        String storedFilename = UUID.randomUUID() + (extension == null ? "" : "." + extension);

        String storageKey = buildStorageKey(pathSegments, storedFilename);
        Path target = resolveSafe(storageKey);

        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new StorageIOException("Failed to write upload to " + storageKey, e);
        }

        Dimension dim = readImageDimensions(target);
        return new StoredFile(
                original,
                storedFilename,
                storageKey,
                urlResolver.publicUrl(storageKey),
                file.getContentType(),
                file.getSize(),
                dim.width,
                dim.height
        );
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return;
        try {
            Path target = resolveSafe(storageKey);
            boolean removed = Files.deleteIfExists(target);
            if (removed) {
                log.debug("Deleted file {}", storageKey);
            }
        } catch (IOException e) {
            log.warn("Failed to delete {}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public boolean exists(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return false;
        return Files.exists(resolveSafe(storageKey));
    }

    @Override
    public String publicUrl(String storageKey) {
        return urlResolver.publicUrl(storageKey);
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        try {
            Path target = resolveSafe(storageKey);
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new StorageIOException("File not readable: " + storageKey, null);
            }
            return resource;
        } catch (IOException e) {
            throw new StorageIOException("Failed to load " + storageKey, e);
        }
    }

    // ----------------------------------------------------------------

    /** Prevents path traversal: keys must resolve under {@link #rootPath}. */
    private Path resolveSafe(String storageKey) {
        Path resolved = rootPath.resolve(storageKey).normalize();
        if (!resolved.startsWith(rootPath)) {
            throw new StorageIOException("Illegal storage key: " + storageKey, null);
        }
        return resolved;
    }

    private static String buildStorageKey(List<String> segments, String filename) {
        StringBuilder sb = new StringBuilder();
        for (String s : segments) {
            if (s == null || s.isBlank()) continue;
            sb.append(s.replace('\\', '/').replaceAll("^/+|/+$", ""));
            sb.append('/');
        }
        sb.append(filename);
        return sb.toString();
    }

    private static String sanitiseExtension(String ext) {
        if (ext == null) return null;
        String clean = ext.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return clean.isEmpty() ? null : clean;
    }

    /** Best-effort dimension read. ImageIO returns null for non-images or corrupt files. */
    private static Dimension readImageDimensions(Path path) {
        try {
            BufferedImage img = ImageIO.read(path.toFile());
            if (img == null) return new Dimension(null, null);
            return new Dimension(img.getWidth(), img.getHeight());
        } catch (IOException e) {
            return new Dimension(null, null);
        }
    }

    private record Dimension(Integer width, Integer height) {}

    /** Wraps IO failures so the controller layer can surface them uniformly. */
    public static class StorageIOException extends RuntimeException {
        public StorageIOException(String msg, Throwable cause) { super(msg, cause); }
    }
}
