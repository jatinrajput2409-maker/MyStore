package com.example.appplatform.modules.apps.dto;

import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.apps.model.AppVisibility;
import com.example.appplatform.modules.apps.model.Platform;
import lombok.Data;

import java.time.Instant;

/**
 * Lightweight app DTO for list/search endpoints.
 * Omits description and screenshots to reduce payload size.
 */
@Data
public class AppSummaryDto {
    private String id;
    private String slug;
    private String name;
    private String shortDescription;
    private Platform platform;
    private String categoryId;
    private String categoryName;
    private String webUrl;
    private AppStatus status;
    private AppVisibility visibility;
    private String iconUrl;
    private String currentVersionName;
    private long downloadCount;
    private Instant publishedAt;
    private Instant updatedAt;
}
