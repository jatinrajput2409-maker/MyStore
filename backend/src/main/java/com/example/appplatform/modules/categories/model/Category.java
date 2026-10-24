package com.example.appplatform.modules.categories.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "categories")
@Data
public class Category {

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    private String name;

    private String description;

    /** Object key for category icon stored in S3 */
    private String iconObjectKey;

    private int sortOrder = 0;

    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
