package com.company.furniturecatalog.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Storage abstraction. The current implementation writes to the local
 * filesystem; a future S3/GCS implementation will honour the same contract.
 *
 * Callers never construct storage keys directly — they hand domain-shaped
 * path segments built via {@link MediaDomain}.
 */
public interface StorageService {

    /**
     * Stores a multipart upload under the given domain path segments. The
     * final filename is generated (UUID + sanitized extension) so two
     * identically-named client uploads never collide.
     */
    StoredFile store(MultipartFile file, List<String> pathSegments);

    /**
     * Removes the file at {@code storageKey}. Idempotent: missing files
     * and blank keys are silently ignored so callers can safely "delete
     * old, write new" without pre-checking.
     */
    void delete(String storageKey);

    /** True iff the file is currently present in the backing store. */
    boolean exists(String storageKey);

    /** Ready-to-serve URL (derived from the configured public base URL). */
    String publicUrl(String storageKey);

    /** Low-level read. Used by admin-only download/preview endpoints. */
    Resource loadAsResource(String storageKey);
}
