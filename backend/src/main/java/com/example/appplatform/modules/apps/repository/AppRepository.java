package com.example.appplatform.modules.apps.repository;

import com.example.appplatform.modules.apps.model.App;
import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.apps.model.Platform;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface AppRepository extends MongoRepository<App, String> {

    Optional<App> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByPackageName(String packageName);

    /** List published public apps, newest first */
    Page<App> findAllByStatusAndVisibility(AppStatus status, String visibility, Pageable pageable);

    /** List published apps by platform */
    Page<App> findAllByStatusAndPlatform(AppStatus status, Platform platform, Pageable pageable);

    /** List published apps by category */
    Page<App> findAllByStatusAndCategoryId(AppStatus status, String categoryId, Pageable pageable);

    /** Full-text search is handled via MongoTemplate in the service layer */

    /** Admin: list all apps regardless of status */
    Page<App> findAll(Pageable pageable);

    /** Featured apps — published with a featuredAt timestamp */
    @Query("{ 'status': 'PUBLISHED', 'featuredAt': { $ne: null } }")
    Page<App> findFeatured(Pageable pageable);
}
