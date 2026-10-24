package com.example.appplatform.modules.apps.controller;

import com.example.appplatform.common.response.ApiResponse;
import com.example.appplatform.common.response.PagedResponse;
import com.example.appplatform.modules.apps.dto.AppDto;
import com.example.appplatform.modules.apps.dto.AppSummaryDto;
import com.example.appplatform.modules.apps.dto.CreateAppRequest;
import com.example.appplatform.modules.apps.model.Platform;
import com.example.appplatform.modules.apps.service.AppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Apps")
public class AppController {

    private final AppService appService;

    // ---- Public endpoints ----

    @GetMapping("/apps")
    @Operation(summary = "List all published public apps")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> listPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "publishedAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
            Sort.by(Sort.Direction.fromString(direction), sort));
        return ResponseEntity.ok(ApiResponse.ok(appService.listPublished(pageable)));
    }

    @GetMapping("/apps/platform/{platform}")
    @Operation(summary = "List apps by platform (ANDROID or IOS)")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> listByPlatform(
            @PathVariable Platform platform,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return ResponseEntity.ok(ApiResponse.ok(appService.listByPlatform(platform, pageable)));
    }

    @GetMapping("/apps/category/{slug}")
    @Operation(summary = "List apps in a category")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> listByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return ResponseEntity.ok(ApiResponse.ok(appService.listByCategory(slug, pageable)));
    }

    @GetMapping("/apps/search")
    @Operation(summary = "Full-text search of published apps")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(appService.search(q, pageable)));
    }

    @GetMapping("/apps/featured")
    @Operation(summary = "List featured apps")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> listFeatured(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "featuredAt"));
        return ResponseEntity.ok(ApiResponse.ok(appService.listFeatured(pageable)));
    }

    @GetMapping("/apps/{slug}")
    @Operation(summary = "Get published app detail by slug")
    public ResponseEntity<ApiResponse<AppDto>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(appService.getPublishedBySlug(slug)));
    }

    // ---- Admin endpoints ----

    @GetMapping("/admin/apps")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List all apps (admin)")
    public ResponseEntity<ApiResponse<PagedResponse<AppSummaryDto>>> adminListAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(appService.listAll(pageable)));
    }

    @GetMapping("/admin/apps/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get any app by ID (admin)")
    public ResponseEntity<ApiResponse<AppDto>> adminGetById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(appService.getById(id)));
    }

    @PostMapping("/admin/apps")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','EDITOR')")
    @Operation(summary = "Create a new app")
    public ResponseEntity<ApiResponse<AppDto>> create(
            @Valid @RequestBody CreateAppRequest request,
            Authentication auth) {
        AppDto created = appService.create(request, (String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(created));
    }

    @PutMapping("/admin/apps/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','EDITOR')")
    @Operation(summary = "Update app metadata")
    public ResponseEntity<ApiResponse<AppDto>> update(
            @PathVariable String id,
            @Valid @RequestBody CreateAppRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appService.update(id, request)));
    }

    @PostMapping("/admin/apps/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Publish an app")
    public ResponseEntity<ApiResponse<AppDto>> publish(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(appService.publish(id)));
    }

    @PostMapping("/admin/apps/{id}/unpublish")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Unpublish an app")
    public ResponseEntity<ApiResponse<AppDto>> unpublish(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(appService.unpublish(id)));
    }

    @PostMapping("/admin/apps/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Archive an app")
    public ResponseEntity<ApiResponse<AppDto>> archive(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(appService.archive(id)));
    }

    @DeleteMapping("/admin/apps/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Soft delete an app (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        appService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
