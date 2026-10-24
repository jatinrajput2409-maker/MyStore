package com.example.appplatform.modules.categories.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CategoryDto {
    private String id;
    private String slug;
    private String name;
    private String description;
    private String iconUrl;
    private int sortOrder;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
