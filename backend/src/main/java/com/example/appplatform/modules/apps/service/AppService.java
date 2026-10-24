package com.example.appplatform.modules.apps.service;

import com.example.appplatform.common.exception.ConflictException;
import com.example.appplatform.common.exception.ResourceNotFoundException;
import com.example.appplatform.common.exception.ValidationException;
import com.example.appplatform.common.response.PagedResponse;
import com.example.appplatform.common.util.SlugUtils;
import com.example.appplatform.modules.apps.dto.AppDto;
import com.example.appplatform.modules.apps.dto.AppSummaryDto;
import com.example.appplatform.modules.apps.dto.CreateAppRequest;
import com.example.appplatform.modules.apps.mapper.AppMapper;
import com.example.appplatform.modules.apps.model.App;
import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.apps.model.AppVisibility;
import com.example.appplatform.modules.apps.model.Platform;
import com.example.appplatform.modules.apps.repository.AppRepository;
import com.example.appplatform.modules.versions.model.AppVersion;
import com.example.appplatform.modules.versions.repository.VersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AppService {

    private final AppRepository appRepository;
    private final VersionRepository versionRepository;
    private final AppMapper appMapper;
    private final MongoTemplate mongoTemplate;

    // ---- Public API ----

    public PagedResponse<AppSummaryDto> listPublished(Pageable pageable) {
        Page<App> page = appRepository.findAllByStatusAndVisibility(
            AppStatus.PUBLISHED, AppVisibility.PUBLIC.name(), pageable);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    public PagedResponse<AppSummaryDto> listByPlatform(Platform platform, Pageable pageable) {
        Page<App> page = appRepository.findAllByStatusAndPlatform(
            AppStatus.PUBLISHED, platform, pageable);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    public PagedResponse<AppSummaryDto> listByCategory(String categorySlug, Pageable pageable) {
        // Category slug -> id mapping done via query
        Query q = new Query(Criteria.where("slug").is(categorySlug));
        var category = mongoTemplate.findOne(q,
            com.example.appplatform.modules.categories.model.Category.class);
        if (category == null) {
            throw new ResourceNotFoundException("Category not found: " + categorySlug);
        }
        Page<App> page = appRepository.findAllByStatusAndCategoryId(
            AppStatus.PUBLISHED, category.getId(), pageable);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    public PagedResponse<AppSummaryDto> search(String query, Pageable pageable) {
        TextCriteria textCriteria = TextCriteria.forDefaultLanguage().matchingAny(query);
        Query mongoQuery = new Query(
            Criteria.where("status").is(AppStatus.PUBLISHED.name())
                .andOperator(Criteria.where("visibility").is(AppVisibility.PUBLIC.name()))
        ).addCriteria(textCriteria);
        mongoQuery.with(pageable);

        var results = mongoTemplate.find(mongoQuery, App.class);
        long count = mongoTemplate.count(mongoQuery.skip(0).limit(0), App.class);

        // Return as simple page — for full production use, wrap with PageImpl
        var page = new org.springframework.data.domain.PageImpl<>(results, pageable, count);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    public AppDto getPublishedBySlug(String slug) {
        App app = appRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("App not found: " + slug));

        if (app.getStatus() != AppStatus.PUBLISHED) {
            throw new ResourceNotFoundException("App not found: " + slug);
        }

        AppVersion currentVersion = null;
        if (app.getCurrentVersionId() != null) {
            currentVersion = versionRepository.findById(app.getCurrentVersionId()).orElse(null);
        }
        return appMapper.toDto(app, currentVersion);
    }

    public PagedResponse<AppSummaryDto> listFeatured(Pageable pageable) {
        Page<App> page = appRepository.findFeatured(pageable);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    // ---- Admin API ----

    public PagedResponse<AppSummaryDto> listAll(Pageable pageable) {
        Page<App> page = appRepository.findAll(pageable);
        return new PagedResponse<>(page.map(appMapper::toSummaryDto));
    }

    public AppDto getById(String id) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));
        AppVersion currentVersion = null;
        if (app.getCurrentVersionId() != null) {
            currentVersion = versionRepository.findById(app.getCurrentVersionId()).orElse(null);
        }
        return appMapper.toDto(app, currentVersion);
    }

    public AppDto create(CreateAppRequest request, String createdByUserId) {
        String slug = SlugUtils.slugify(request.getName());
        if (appRepository.existsBySlug(slug)) {
            throw new ConflictException("An app with this name already exists");
        }

        if (request.getPackageName() != null &&
                appRepository.existsByPackageName(request.getPackageName())) {
            throw new ConflictException(
                "An app with package name '" + request.getPackageName() + "' already exists");
        }

        App app = new App();
        app.setSlug(slug);
        app.setName(request.getName());
        app.setDescription(request.getDescription());
        app.setShortDescription(request.getShortDescription());
        app.setPlatform(request.getPlatform());
        app.setCategoryId(request.getCategoryId());
        app.setPackageName(request.getPackageName());
        app.setBundleId(request.getBundleId());
        app.setVisibility(request.getVisibility());
        app.setStatus(AppStatus.DRAFT);
        app.setCreatedBy(createdByUserId);

        App saved = appRepository.save(app);
        return appMapper.toDto(saved, null);
    }

    public AppDto update(String id, CreateAppRequest request) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));

        app.setName(request.getName());
        app.setDescription(request.getDescription());
        app.setShortDescription(request.getShortDescription());
        app.setCategoryId(request.getCategoryId());
        app.setVisibility(request.getVisibility());

        return appMapper.toDto(appRepository.save(app), null);
    }

    public AppDto publish(String id) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));

        if (app.getCurrentVersionId() == null) {
            throw new ValidationException(
                "Cannot publish app without a published version. Add and publish a version first.");
        }
        app.setStatus(AppStatus.PUBLISHED);
        app.setPublishedAt(Instant.now());
        return appMapper.toDto(appRepository.save(app), null);
    }

    public AppDto unpublish(String id) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));
        app.setStatus(AppStatus.UNPUBLISHED);
        return appMapper.toDto(appRepository.save(app), null);
    }

    public AppDto archive(String id) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));
        app.setStatus(AppStatus.ARCHIVED);
        return appMapper.toDto(appRepository.save(app), null);
    }

    /** Soft delete — marks as ARCHIVED, preserves for download history references */
    public void softDelete(String id) {
        App app = appRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("App", id));
        app.setStatus(AppStatus.ARCHIVED);
        appRepository.save(app);
    }

    /** Called by VersionService after a version is published */
    public void setCurrentVersion(String appId, String versionId) {
        App app = appRepository.findById(appId)
            .orElseThrow(() -> ResourceNotFoundException.of("App", appId));
        app.setCurrentVersionId(versionId);
        appRepository.save(app);
    }
}
