2026-01-18T08:35:23.788-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-1] m.m.a.RequestResponseBodyMethodProcessor : Using 'application/json', given [application/json, text/plain, */*] and supported [application/json, application/*+json]
2026-01-18T08:35:23.788-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-1] m.m.a.RequestResponseBodyMethodProcessor : Writing [[com.sigeve.manager.dto.products.ProductCategoryDTO@2a5ad929, com.sigeve.manager.dto.products.Produc (truncated)...]
2026-01-18T08:35:23.789-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-01-18T08:35:23.820-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [application/json, text/plain, */*] and supported [application/json, application/*+json]
2026-01-18T08:35:23.824-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-2] o.s.web.servlet.DispatcherServlet        : Completed 200 OK
2026-01-18T08:35:23.829-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed 200 OK
2026-01-18T08:35:23.832-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-01-18T08:35:23.790895500, status=500, error=Internal Server Error, mess (truncated)...]
2026-01-18T08:35:23.836-03:00  WARN 10836 --- [Manager] [nio-8080-exec-4] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.dao.InvalidDataAccessApiUsageException: Unable to locate Attribute with the given name [supplier] on this ManagedType [com.sigeve.manager.domain.model.Product]]
2026-01-18T08:35:23.836-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR
2026-01-18T08:35:23.848-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] o.s.web.servlet.DispatcherServlet        : GET "/api/product-categories", parameters={}
2026-01-18T08:35:23.848-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] o.s.web.servlet.DispatcherServlet        : GET "/api/companies/suppliers", parameters={}
2026-01-18T08:35:23.848-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped to com.sigeve.manager.domain.controller.ProductCategoryController#findAll(String, Pageable)
2026-01-18T08:35:23.848-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped to com.sigeve.manager.domain.controller.CompanyController#suppliers()
2026-01-18T08:35:23.850-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] org.hibernate.SQL                        : 
    /* <criteria> */ select
        c1_0.company_id,
        c1_0.cnpj,
        c1_0.corporate_name,
        c1_0.created_at,
        c1_0.created_by,
        c1_0.customer_flag,
        c1_0.deleted_at,
        c1_0.deleted_by,
        c1_0.email,
        c1_0.funrural_rate,
        c1_0.is_active,
        c1_0.iss_rate,
        c1_0.phone,
        c1_0.supplier_flag,
        c1_0.tenant_id,
        c1_0.trade_name,
        c1_0.transporter_flag,
        c1_0.updated_at,
        c1_0.updated_by 
    from
        tab_companies c1_0 
    where
        c1_0.supplier_flag 
    order by
        c1_0.trade_name
2026-01-18T08:35:23.853-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] m.m.a.RequestResponseBodyMethodProcessor : Using 'application/json', given [application/json, text/plain, */*] and supported [application/json, application/*+json]
2026-01-18T08:35:23.853-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] m.m.a.RequestResponseBodyMethodProcessor : Writing [[com.sigeve.manager.dto.companies.CompanyMinDTO@4cf368d2, com.sigeve.manager.dto.companies.CompanyMi (truncated)...]
2026-01-18T08:35:23.855-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-3] o.s.web.servlet.DispatcherServlet        : Completed 200 OK
2026-01-18T08:35:23.856-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] o.s.web.servlet.DispatcherServlet        : GET "/api/products", parameters={}
2026-01-18T08:35:23.857-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped to com.sigeve.manager.domain.controller.ProductController#findAll(String, int, int)
2026-01-18T08:35:23.860-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-01-18T08:35:23.861-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [application/json, text/plain, */*] and supported [application/json, application/*+json]
2026-01-18T08:35:23.861-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-01-18T08:35:23.860854300, status=500, error=Internal Server Error, mess (truncated)...]
2026-01-18T08:35:23.861-03:00  WARN 10836 --- [Manager] [nio-8080-exec-5] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.dao.InvalidDataAccessApiUsageException: Unable to locate Attribute with the given name [supplier] on this ManagedType [com.sigeve.manager.domain.model.Product]]
2026-01-18T08:35:23.861-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-5] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR
2026-01-18T08:35:23.863-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] org.hibernate.SQL                        : 
    /* <criteria> */ select
        pc1_0.product_category_id,
        pc1_0.created_at,
        pc1_0.name,
        pc1_0.updated_at 
    from
        tab_product_categories pc1_0 
    where
        upper(pc1_0.name) like upper(?) escape '\' 
    order by
        pc1_0.name 
    offset
        ? rows 
    fetch
        first ? rows only
2026-01-18T08:35:23.865-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] m.m.a.RequestResponseBodyMethodProcessor : Using 'application/json', given [application/json, text/plain, */*] and supported [application/json, application/*+json]
2026-01-18T08:35:23.865-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] m.m.a.RequestResponseBodyMethodProcessor : Writing [[com.sigeve.manager.dto.products.ProductCategoryDTO@3a826d76, com.sigeve.manager.dto.products.Produc (truncated)...]
2026-01-18T08:35:23.866-03:00 DEBUG 10836 --- [Manager] [nio-8080-exec-4] o.s.web.servlet.DispatcherServlet        : Completed 200 OK
