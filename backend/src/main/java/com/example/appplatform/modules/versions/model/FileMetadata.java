package com.example.appplatform.modules.versions.model;

import lombok.Data;

/**
 * File metadata embedded in AppVersion.
 * Stored in MongoDB alongside version metadata.
 * The actual binary is stored in S3 at objectKey.
 */
@Data
public class FileMetadata {

    private String originalFilename;

    /** S3 object key — server-generated UUID path, never user-supplied */
    private String objectKey;

    private String mimeType;

    private long sizeBytes;

    /** SHA-256 hex checksum computed server-side */
    private String sha256Checksum;
}
