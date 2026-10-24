package com.example.appplatform.modules.apps.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "apps")
@Data
@CompoundIndex(name = "platform_status_published",
    def = "{'platform': 1, 'status': 1, 'publishedAt': -1}")
@CompoundIndex(name = "category_status",
    def = "{'categoryId': 1, 'status': 1}")
public class App {

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    @TextIndexed(weight = 10)
    private String name;

    @TextIndexed(weight = 5)
    private String description;

    private String shortDescription;

    private Platform platform;

    private String categoryId;

    /**
     * Android package name (e.g. com.example.myapp).
     * Null for iOS apps. Unique constraint enforced per platform in service layer.
     */
    @Indexed(sparse = true)
    private String packageName;

    /** iOS bundle identifier. Null for Android. */
    private String bundleId;

    /** Web application launch / direct URL for WEB platform */
    private String webUrl;

    private AppStatus status = AppStatus.DRAFT;

    private AppVisibility visibility = AppVisibility.PUBLIC;

    /** Object key for app icon in S3 */
    private String iconObjectKey;

    /** Object keys for screenshots in S3 */
    private List<String> screenshotObjectKeys = new ArrayList<>();

    /** Reference to the currently published AppVersion document */
    private String currentVersionId;

    private Instant featuredAt;

    private Instant publishedAt;

    /** ID of admin user who created this app */
    private String createdBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
