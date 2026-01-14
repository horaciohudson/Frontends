 JwtAuthenticationFilter: POST /api/raw-material-movements
   🔑 Token JWT encontrado - validando...
   📋 Claims extraídos:
      user_id: 2220e52f-d8d4-4800-b07c-c54d39abadaa
      username: admin
      tenant_id: dc7fa6cd-9723-4fa9-a570-fcf364690aae
      roles: [ROLE_ADMIN]
      ✅ Authority adicionada: ROLE_ADMIN
   ✅ Autenticação configurada no SecurityContext
2025-12-26T11:24:08.749-03:00  WARN 4464 --- [sigeve-prodution] [nio-8080-exec-5] .w.s.m.s.DefaultHandlerExceptionResolver : Resolved [org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: Cannot deserialize value of type `java.time.OffsetDateTime` from String "2025-12-26": Failed to deserialize java.time.OffsetDateTime: (java.time.format.DateTimeParseException) Text '2025-12-26' could not be parsed at index 10]
        and po1_0.deleted_at is null
Hibernate: 
    select
        pp1_0.production_product_id,
        pp1_0.barcode,
        pp1_0.cancellation_reason,
        pp1_0.cancelled_at,
        pp1_0.cancelled_by,
        pp1_0.color,
        pp1_0.company_id,
        pp1_0.created_at,
        pp1_0.created_by,
        pp1_0.deleted_at,
        pp1_0.deleted_by,
        pp1_0.description,
        pp1_0.image_url,
        pp1_0.is_active,
        pp1_0.notes,
        pp1_0.product_id,
        pp1_0.size,
        pp1_0.sku,
        pp1_0.tenant_id,
        pp1_0.unit_type,
        pp1_0.updated_at,
        pp1_0.updated_by,
        pp1_0.version 
    from
        tab_production_products pp1_0 
    where
        pp1_0.production_product_id=?
🔍 JwtAuthenticationFilter: GET /api/production-costs/paged
   🔑 Token JWT encontrado - validando...
   📋 Claims extraídos:
      user_id: 2220e52f-d8d4-4800-b07c-c54d39abadaa
      username: admin
      tenant_id: dc7fa6cd-9723-4fa9-a570-fcf364690aae
      roles: [ROLE_ADMIN]
      ✅ Authority adicionada: ROLE_ADMIN
   ✅ Autenticação configurada no SecurityContext
2025-12-26T12:34:20.739-03:00  WARN 6832 --- [sigeve-prodution] [nio-8080-exec-2] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.method.annotation.MethodArgumentTypeMismatchException: Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'java.util.UUID'; Invalid UUID string: paged]
🔍 JwtAuthenticationFilter: GET /api/production-costs
   🔑 Token JWT encontrado - validando...
   📋 Claims extraídos:
      user_id: 2220e52f-d8d4-4800-b07c-c54d39abadaa
      username: admin
      tenant_id: dc7fa6cd-9723-4fa9-a570-fcf364690aae
      roles: [ROLE_ADMIN]
      ✅ Authority adicionada: ROLE_ADMIN
   ✅ Autenticação configurada no SecurityContext
2025-12-26T12:34:20.763-03:00  WARN 6832 --- [sigeve-prodution] [nio-8080-exec-6] .w.s.m.s.DefaultHandlerExceptionResolver : Resolved [org.springframework.web.HttpRequestMethodNotSupportedException: Request method 'GET' is not supported]
