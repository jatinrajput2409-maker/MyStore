package com.example.appplatform.modules.categories.service;

import com.example.appplatform.common.exception.ConflictException;
import com.example.appplatform.common.exception.ResourceNotFoundException;
import com.example.appplatform.common.util.SlugUtils;
import com.example.appplatform.modules.categories.dto.CategoryDto;
import com.example.appplatform.modules.categories.dto.CreateCategoryRequest;
import com.example.appplatform.modules.categories.mapper.CategoryMapper;
import com.example.appplatform.modules.categories.model.Category;
import com.example.appplatform.modules.categories.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryDto> listActive() {
        return categoryRepository.findAllByActiveTrueOrderBySortOrderAsc()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    public List<CategoryDto> listAll() {
        return categoryRepository.findAll()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    public CategoryDto getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        return categoryMapper.toDto(category);
    }

    public CategoryDto create(CreateCategoryRequest request) {
        String slug = SlugUtils.slugify(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("A category with this name already exists: " + slug);
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setSortOrder(request.getSortOrder());
        category.setActive(true);

        return categoryMapper.toDto(categoryRepository.save(category));
    }

    public CategoryDto update(String id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("Category", id));

        String newSlug = SlugUtils.slugify(request.getName());
        if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
            throw new ConflictException("A category with this slug already exists: " + newSlug);
        }

        category.setName(request.getName());
        category.setSlug(newSlug);
        category.setDescription(request.getDescription());
        category.setSortOrder(request.getSortOrder());

        return categoryMapper.toDto(categoryRepository.save(category));
    }

    /** Soft deactivate — never hard-deletes to preserve references in existing apps */
    public void deactivate(String id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
        category.setActive(false);
        categoryRepository.save(category);
    }
}
