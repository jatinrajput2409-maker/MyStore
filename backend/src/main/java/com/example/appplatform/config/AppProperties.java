package com.example.appplatform.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Strongly-typed binding of all custom app.* properties from application.yml.
 * Prefer this over @Value annotations for related groups of configuration.
 */
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Storage storage = new Storage();
    private Security security = new Security();
    private Admin admin = new Admin();
    private Files files = new Files();
    private DownloadEvents downloadEvents = new DownloadEvents();

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpiryMs;
        private long refreshTokenExpiryMs;
    }

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Storage {
        private String provider;
        private String bucket;
        private String region;
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String quarantinePrefix;
        private String filesPrefix;
        private int presignedUrlTtlMinutes;
    }

    @Data
    public static class Security {
        private int loginMaxAttempts;
        private int loginLockoutMinutes;
        private int uploadRateLimitPerHour;
    }

    @Data
    public static class Admin {
        private String setupSecret;
    }

    @Data
    public static class Files {
        private long maxApkSizeBytes;
        private long maxIconSizeBytes;
        private long maxScreenshotSizeBytes;
    }

    @Data
    public static class DownloadEvents {
        private int ttlDays;
    }
}
