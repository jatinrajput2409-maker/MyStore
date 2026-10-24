package com.example.appplatform.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility for generating URL-safe slugs from arbitrary strings.
 */
public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern REPEATED_DASH = Pattern.compile("-+");

    private SlugUtils() {}

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Cannot slugify blank input");
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized
            .toLowerCase(Locale.ROOT)
            .trim();
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = REPEATED_DASH.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");

        if (slug.isBlank()) {
            throw new IllegalArgumentException("Slug is empty after normalization: " + input);
        }
        return slug;
    }
}
