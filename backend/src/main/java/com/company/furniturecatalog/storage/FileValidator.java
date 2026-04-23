package com.company.furniturecatalog.storage;

import com.company.furniturecatalog.config.properties.StorageProperties;
import com.company.furniturecatalog.exception.FileValidationException;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Three-layer image validation:
 *  1. Empty upload / null filename → reject.
 *  2. Reported {@code Content-Type} must be in the allowlist.
 *  3. Extension (from the original filename) must be in the allowlist.
 *  4. Size must be &lt; configured {@code app.storage.images.max-size}.
 *
 * This catches accidental mismatches (e.g. renamed .png that declares
 * application/octet-stream). Magic-byte sniffing via Apache Tika is a
 * natural follow-up when untrusted uploads become a concern.
 */
@Component
public class FileValidator {

    private static final Set<String> DEFAULT_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> DEFAULT_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");
    private static final DataSize DEFAULT_MAX_SIZE = DataSize.ofMegabytes(8);

    private final Set<String> allowedContentTypes;
    private final Set<String> allowedExtensions;
    private final long maxSizeBytes;

    public FileValidator(StorageProperties properties) {
        StorageProperties.Images images = properties.images();
        this.allowedContentTypes = normalise(
                images != null ? images.allowedContentTypes() : null,
                DEFAULT_CONTENT_TYPES);
        this.allowedExtensions = normalise(
                images != null ? images.allowedExtensions() : null,
                DEFAULT_EXTENSIONS);
        DataSize maxSize = images != null && images.maxSize() != null ? images.maxSize() : DEFAULT_MAX_SIZE;
        this.maxSizeBytes = maxSize.toBytes();
    }

    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("File is empty");
        }

        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw new FileValidationException("File name is missing");
        }

        String contentType = Optional.ofNullable(file.getContentType())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new FileValidationException("Content-Type header is missing"));
        if (!allowedContentTypes.contains(contentType)) {
            throw new FileValidationException(
                    "Unsupported content type '" + contentType + "'. Allowed: " + allowedContentTypes);
        }

        String ext = extensionOf(original);
        if (ext == null || !allowedExtensions.contains(ext)) {
            throw new FileValidationException(
                    "Unsupported file extension '" + ext + "'. Allowed: " + allowedExtensions);
        }

        if (file.getSize() > maxSizeBytes) {
            throw new FileValidationException(
                    "File too large (" + file.getSize() + " bytes). Maximum is " + maxSizeBytes + " bytes.");
        }
    }

    /** Lowercase extension without the dot, or null if none / too long. */
    public static String extensionOf(String filename) {
        if (filename == null) return null;
        int dot = filename.lastIndexOf('.');
        if (dot <= 0 || dot == filename.length() - 1) return null;
        String ext = filename.substring(dot + 1).toLowerCase(Locale.ROOT);
        // Defensive: extensions should be short; anything longer is suspicious.
        return ext.length() > 10 ? null : ext;
    }

    private static Set<String> normalise(List<String> configured, Set<String> fallback) {
        if (configured == null || configured.isEmpty()) return fallback;
        return configured.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }
}
