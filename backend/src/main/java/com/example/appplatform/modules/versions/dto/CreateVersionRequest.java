package com.example.appplatform.modules.versions.dto;

import com.example.appplatform.modules.versions.model.AppVersion;
import com.example.appplatform.modules.versions.model.ReleaseChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateVersionRequest {

    @NotBlank(message = "Version name is required (e.g. 1.0.0)")
    @Size(max = 32, message = "Version name too long")
    private String versionName;

    private Integer versionCode;

    private String buildNumber;

    @NotNull(message = "Release channel is required")
    private ReleaseChannel releaseChannel;

    @Size(max = 5000, message = "Release notes too long")
    private String releaseNotes;

    /**
     * The upload job ID returned by POST /admin/upload/init.
     * The backend uses this to locate the validated file in S3
     * and attach it to this version record.
     */
    @NotBlank(message = "Upload job ID is required")
    private String uploadJobId;

    // iOS-only fields (null for Android)
    private AppVersion.IosDistributionMethod iosDistributionMethod;
    private String iosInstallLink;
    private String iosManifestUrl;
    private Instant iosExpiresAt;
    private String iosMinimumOsVersion;
    private String iosInstructions;

    private Instant scheduledPublishAt;
}
