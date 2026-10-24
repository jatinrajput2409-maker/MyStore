package com.example.appplatform.modules.versions.repository;

import com.example.appplatform.modules.apps.model.AppStatus;
import com.example.appplatform.modules.versions.model.AppVersion;
import com.example.appplatform.modules.versions.model.ReleaseChannel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VersionRepository extends MongoRepository<AppVersion, String> {

    Page<AppVersion> findAllByAppId(String appId, Pageable pageable);

    List<AppVersion> findAllByAppIdAndStatus(String appId, AppStatus status);

    List<AppVersion> findAllByAppIdAndReleaseChannelAndStatus(
        String appId, ReleaseChannel channel, AppStatus status);

    long countByAppId(String appId);
}
