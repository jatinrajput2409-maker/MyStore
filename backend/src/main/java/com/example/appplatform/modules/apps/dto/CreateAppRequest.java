package com.example.appplatform.modules.apps.dto;

import com.example.appplatform.modules.apps.model.AppVisibility;
import com.example.appplatform.modules.apps.model.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAppRequest {

    @NotBlank(message = "App name is required")
    @Size(min = 2, max = 128, message = "Name must be between 2 and 128 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    @Size(max = 200, message = "Short description cannot exceed 200 characters")
    private String shortDescription;

    @NotNull(message = "Platform is required")
    private Platform platform;

    private String categoryId;

    private String packageName;

    private String bundleId;

    private String webUrl;

    private AppVisibility visibility = AppVisibility.PUBLIC;
}
