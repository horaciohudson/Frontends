2025-12-15T16:23:42.000-03:00 DEBUG 7348 --- [sigeve] [nio-8081-exec-7] o.s.security.web.FilterChainProxy        : Securing GET /api/products?size=10
✅ Autenticação construída para: admin@sigeve.com
✅ Autoridades do token: [ROLE_ADMIN]
2025-12-15T16:23:42.005-03:00 DEBUG 7348 --- [sigeve] [nio-8081-exec-7] o.s.security.web.FilterChainProxy        : Secured GET /api/products?size=10
Hibernate: 
    select
        p1_0.product_id,
        p1_0.cancellation_reason,
        p1_0.cancelled_at,
        p1_0.cancelled_by,
        p1_0.created_at,
        p1_0.created_by,
        p1_0.deleted_at,
        p1_0.deleted_by,
        p1_0.packaging,
        p1_0.product_category_id,
        pc1_0.product_category_id,
        pc1_0.created_at,
        pc1_0.name,
        pc1_0.updated_at,
        p1_0.product_name,
        ps1_0.product_size_id,
        ps1_0.created_at,
        ps1_0.position,
        ps1_0.product_sub_category_id,
        ps1_0.size,
        ps1_0.stock,
        ps1_0.updated_at,
        p1_0.product_sub_category_id,
        psc2_0.product_sub_category_id,
        psc2_0.created_at,
        psc2_0.name,
        psc2_0.product_category_id,
        psc2_0.updated_at,
        p1_0.reference,
        p1_0.supplier_id,
        s1_0.company_id,
        s1_0.activity_id,
        s1_0.company_address_id,
        s1_0.cnpj,
        s1_0.corporate_name,
        s1_0.created_at,
        s1_0.currency_id,
        s1_0.customer_flag,
        s1_0.email,
        s1_0.factory,
        s1_0.funrural_rate,
        s1_0.iss_rate,
        s1_0.manager,
        s1_0.mobile,
        s1_0.municipal_registration,
        s1_0.phone,
        s1_0.state_registration,
        s1_0.supplier_flag,
        s1_0.trade_name,
        s1_0.transporter_flag,
        s1_0.updated_at,
        s1_0.whatsapp,
        p1_0.technical_reference,
        p1_0.updated_at,
        p1_0.updated_by,
        p1_0.warranty_months 
    from
        tab_products p1_0 
    join
        tab_product_categories pc1_0 
            on pc1_0.product_category_id=p1_0.product_category_id 
    left join
        tab_product_sizes ps1_0 
            on ps1_0.product_size_id=p1_0.product_size_id 
    join
        tab_product_sub_categories psc2_0 
            on psc2_0.product_sub_category_id=p1_0.product_sub_category_id 
    join
        tab_companies s1_0 
            on s1_0.company_id=p1_0.supplier_id 
    offset
        ? rows 
    fetch
        first ? rows only
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
Hibernate: 
    select
        pc1_0.product_cost_id,
        pc1_0.acquisition_value,
        pc1_0.average_cost,
        pc1_0.broker_commission,
        pc1_0.commission_percentage,
        pc1_0.commission_value,
        pc1_0.created_at,
        pc1_0.freight_value,
        pc1_0.gross_value,
        pc1_0.icms_credit_value,
        pc1_0.ipi_value,
        pc1_0.mean_value,
        pc1_0.net_value,
        pc1_0.product_id,
        pc1_0.seller_commission,
        pc1_0.tax_value,
        pc1_0.updated_at 
    from
        tab_product_costs pc1_0 
    where
        pc1_0.product_id=?
2025-12-15T16:24:32.346-03:00 DEBUG 7348 --- [sigeve] [nio-8081-exec-6] o.s.security.web.FilterChainProxy        : Securing POST /api/purchase-items
✅ Autenticação construída para: admin@sigeve.com
✅ Autoridades do token: [ROLE_ADMIN]
2025-12-15T16:24:32.361-03:00 DEBUG 7348 --- [sigeve] [nio-8081-exec-6] o.s.security.web.FilterChainProxy        : Secured POST /api/purchase-items
2025-12-15T16:24:32.391-03:00  WARN 7348 --- [sigeve] [nio-8081-exec-6] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: Cannot deserialize value of type `java.lang.Integer` from String "4e03cc99-fb90-46f9-a33b-a751e12ee53a": not a valid `java.lang.Integer` value]
