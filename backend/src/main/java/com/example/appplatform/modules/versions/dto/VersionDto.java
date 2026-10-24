package com.example.appplatform.modules.versions.dto;

import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.versions.model.AppVersion;
import com.example.appplatform.modules.versions.model.ReleaseChannel;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class VersionDto {
    private String id;
    private String appId;
    private String versionName;
    private Integer versionCode;
    private String buildNumber;
    private ReleaseChannel releaseChannel;
    private String releaseNotes;
    private AppStatus status;
    private FileMetadataDto fileMetadata;
    private AndroidMetadataDto androidMetadata;
    private IosMetadataDto iosMetadata;
    private long downloadCount;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    public static class FileMetadataDto {
        private String originalFilename;
        private String mimeType;
        private long sizeBytes;
        private String sha256Checksum;
        // objectKey is NOT exposed — only download links are given
    }

    @Data
    public static class AndroidMetadataDto {
        private Integer minSdkVersion;
        private Integer targetSdkVersion;
        private List<String> supportedAbis;
        private String signingCertFingerprint;
    }

    @Data
    public static class IosMetadataDto {
        private AppVersion.IosDistributionMethod distributionMethod;
        private String installLink;
        private String manifestUrl;
        private Instant expiresAt;
        private String minimumOsVersion;
        private String instructions;
    }
}
