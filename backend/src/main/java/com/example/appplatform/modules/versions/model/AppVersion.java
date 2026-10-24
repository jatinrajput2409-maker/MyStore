package com.example.appplatform.modules.versions.model;

import com.example.appplatform.modules.apps.model.AppStatus;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "app_versions")
@Data
@CompoundIndex(name = "app_channel_status_published",
    def = "{'appId': 1, 'releaseChannel': 1, 'status': 1, 'publishedAt': -1}")
public class AppVersion {

    @Id
    private String id;

    /** References the parent app's MongoDB _id */
    private String appId;

    private String versionName;       // e.g. "2.1.0"

    private Integer versionCode;      // Android integer version code

    private String buildNumber;       // iOS build number or general build ID

    private ReleaseChannel releaseChannel = ReleaseChannel.STABLE;

    private String releaseNotes;

    private AppStatus status = AppStatus.DRAFT;

    /** Embedded file metadata — no large binaries stored here */
    private FileMetadata fileMetadata;

    /** Android-specific metadata */
    private AndroidMetadata androidMetadata;

    /** iOS-specific metadata */
    private IosMetadata iosMetadata;

    private long downloadCount = 0;

    private Instant publishedAt;

    private Instant scheduledPublishAt;

    private String uploadedBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    /** Android APK metadata extracted server-side */
    @Data
    public static class AndroidMetadata {
        private Integer minSdkVersion;
        private Integer targetSdkVersion;
        private List<String> supportedAbis;
        /** SHA-256 fingerprint of the APK signing certificate */
        private String signingCertFingerprint;
    }

    /**
     * iOS distribution metadata.
     * The platform does NOT re-host IPA files for arbitrary distribution —
     * only Apple-authorized distribution methods are supported.
     */
    @Data
    public static class IosMetadata {
        private IosDistributionMethod distributionMethod;
        /** The TestFlight / Ad Hoc / Enterprise install link */
        private String installLink;
        /** OTA manifest URL for Ad Hoc / Enterprise plist-based installs */
        private String manifestUrl;
        private Instant expiresAt;
        private String minimumOsVersion;
        private String instructions;
    }

    public enum IosDistributionMethod {
        TESTFLIGHT,
        AD_HOC,
        ENTERPRISE,
        WEB_DISTRIBUTION,
        NOT_AVAILABLE
    }
}
