package com.example.appplatform.modules.categories.controller;

import com.example.appplatform.common.response.ApiResponse;
import com.example.appplatform.modules.categories.dto.CategoryDto;
import com.example.appplatform.modules.categories.dto.CreateCategoryRequest;
import com.example.appplatform.modules.categories.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Categories")
public class CategoryController {

    private final CategoryService categoryService;

    // ---- Public endpoints ----

    @GetMapping("/categories")
    @Operation(summary = "List all active categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> listActive() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.listActive()));
    }

    @GetMapping("/categories/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<CategoryDto>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getBySlug(slug)));
    }

    // ---- Admin endpoints ----

    @GetMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','EDITOR','VIEWER')")
    @Operation(summary = "List all categories including inactive (admin)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> listAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.listAll()));
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryDto>> create(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryDto created = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(created));
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> update(
            @PathVariable String id,
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(id, request)));
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Deactivate a category (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String id) {
        categoryService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
