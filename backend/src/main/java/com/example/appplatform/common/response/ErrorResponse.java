package com.example.appplatform.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

/**
 * Returned by GlobalExceptionHandler for all error responses.
 * Never includes stack traces, internal paths, or credential information.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final boolean success = false;
    private final int status;
    private final String error;
    private final String message;
    private final String correlationId;
    private final Instant timestamp;

    /** Field-level validation errors: field name -> error message */
    private final Map<String, String> fieldErrors;
}
