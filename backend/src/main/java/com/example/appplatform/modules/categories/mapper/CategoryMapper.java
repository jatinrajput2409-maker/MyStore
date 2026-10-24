package com.example.appplatform.modules.categories.mapper;

import com.example.appplatform.modules.categories.dto.CategoryDto;
import com.example.appplatform.modules.categories.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setSlug(category.getSlug());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        // Icon URL is resolved by the service layer before mapping
        dto.setSortOrder(category.getSortOrder());
        dto.setActive(category.isActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}
