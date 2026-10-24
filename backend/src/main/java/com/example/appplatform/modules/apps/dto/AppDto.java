package com.example.appplatform.modules.apps.dto;

import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.apps.model.AppVisibility;
import com.example.appplatform.modules.apps.model.Platform;
import com.example.appplatform.modules.categories.dto.CategoryDto;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/**
 * Full app DTO returned from detail endpoints.
 * The current version info is embedded for convenience (summary only).
 */
@Data
public class AppDto {
    private String id;
    private String slug;
    private String name;
    private String description;
    private String shortDescription;
    private Platform platform;
    private CategoryDto category;
    private String packageName;
    private String bundleId;
    private AppStatus status;
    private AppVisibility visibility;
    private String iconUrl;
    private List<String> screenshotUrls;
    private String currentVersionId;
    private Instant featuredAt;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;
    // Embedded current version summary
    private AppVersionSummary currentVersion;

    @Data
    public static class AppVersionSummary {
        private String id;
        private String versionName;
        private String releaseChannel;
        private long sizeBytes;
        private String releaseNotes;
        private Instant publishedAt;
    }
}
