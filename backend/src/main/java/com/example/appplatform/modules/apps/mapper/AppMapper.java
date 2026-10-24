package com.example.appplatform.modules.apps.mapper;

import com.example.appplatform.modules.apps.dto.AppDto;
import com.example.appplatform.modules.apps.dto.AppSummaryDto;
import com.example.appplatform.modules.apps.model.App;
import com.example.appplatform.modules.versions.model.AppVersion;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Converts App entities to DTOs. URL generation for icons/screenshots
 * is left as a note — in a full implementation, call StorageService.getPublicUrl()
 * here or in the service before mapping.
 */
@Component
public class AppMapper {

    public AppSummaryDto toSummaryDto(App app) {
        AppSummaryDto dto = new AppSummaryDto();
        dto.setId(app.getId());
        dto.setSlug(app.getSlug());
        dto.setName(app.getName());
        dto.setShortDescription(app.getShortDescription());
        dto.setPlatform(app.getPlatform());
        dto.setCategoryId(app.getCategoryId());
        dto.setStatus(app.getStatus());
        dto.setVisibility(app.getVisibility());
        // iconUrl would be resolved via StorageService — omitted here for brevity
        dto.setPublishedAt(app.getPublishedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        return dto;
    }

    public AppDto toDto(App app, AppVersion currentVersion) {
        AppDto dto = new AppDto();
        dto.setId(app.getId());
        dto.setSlug(app.getSlug());
        dto.setName(app.getName());
        dto.setDescription(app.getDescription());
        dto.setShortDescription(app.getShortDescription());
        dto.setPlatform(app.getPlatform());
        dto.setCategoryId(app.getCategoryId());
        dto.setPackageName(app.getPackageName());
        dto.setBundleId(app.getBundleId());
        dto.setStatus(app.getStatus());
        dto.setVisibility(app.getVisibility());
        dto.setCurrentVersionId(app.getCurrentVersionId());
        dto.setFeaturedAt(app.getFeaturedAt());
        dto.setPublishedAt(app.getPublishedAt());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        dto.setScreenshotUrls(new ArrayList<>());

        if (currentVersion != null) {
            AppDto.AppVersionSummary vs = new AppDto.AppVersionSummary();
            vs.setId(currentVersion.getId());
            vs.setVersionName(currentVersion.getVersionName());
            vs.setReleaseChannel(currentVersion.getReleaseChannel().name());
            if (currentVersion.getFileMetadata() != null) {
                vs.setSizeBytes(currentVersion.getFileMetadata().getSizeBytes());
            }
            vs.setReleaseNotes(currentVersion.getReleaseNotes());
            vs.setPublishedAt(currentVersion.getPublishedAt());
            dto.setCurrentVersion(vs);
        }
        return dto;
    }
}
