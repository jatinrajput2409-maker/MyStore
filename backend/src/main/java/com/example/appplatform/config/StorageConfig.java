package com.example.appplatform.config;

import com.example.appplatform.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class StorageConfig {

    private final AppProperties appProperties;

    @Bean
    public S3Client s3Client() {
        AppProperties.Storage storage = appProperties.getStorage();
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            storage.getAccessKey(),
            storage.getSecretKey()
        );
        var builder = S3Client.builder()
            .region(Region.of(storage.getRegion()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials));

        // Support S3-compatible endpoints (MinIO, Cloudflare R2, etc.)
        if (storage.getEndpoint() != null && !storage.getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(storage.getEndpoint()))
                   .forcePathStyle(true);
        }
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        AppProperties.Storage storage = appProperties.getStorage();
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            storage.getAccessKey(),
            storage.getSecretKey()
        );
        var builder = S3Presigner.builder()
            .region(Region.of(storage.getRegion()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials));

        if (storage.getEndpoint() != null && !storage.getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(storage.getEndpoint()));
        }
        return builder.build();
    }
}
