logs Manager

2026-02-02T08:54:29.208-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-1] o.s.w.s.r.ResourceHttpRequestHandler     : Resource not found
2026-02-02T08:54:29.213-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-1] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-02-02T08:54:29.213-03:00 ERROR 9464 --- [Manager] [nio-8080-exec-1] c.s.m.exception.GlobalExceptionHandler   : Unhandled Exception: 

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:206) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at com.sigeve.manager.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:56) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:46) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:50) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1736) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at java.base/java.lang.Thread.run(Thread.java:842) ~[na:na]

2026-02-02T08:54:29.258-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-1] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [text/plain, application/json, application/*+json, */*] and supported [application/json, application/*+json]
2026-02-02T08:54:29.263-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-1] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-02-02T08:54:29.217719400, status=500, error=Internal Server Error, mess (truncated)...]
2026-02-02T08:54:29.278-03:00  WARN 9464 --- [Manager] [nio-8080-exec-1] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.]
2026-02-02T08:54:29.278-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR
2026-02-02T08:54:29.346-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.web.servlet.DispatcherServlet        : GET "/actuator/health", parameters={}
2026-02-02T08:54:29.347-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped to ResourceHttpRequestHandler [classpath [META-INF/resources/], classpath [resources/], classpath [static/], classpath [public/], ServletContext [/]]
2026-02-02T08:54:29.348-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.w.s.r.ResourceHttpRequestHandler     : Resource not found
2026-02-02T08:54:29.348-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-02-02T08:54:29.348-03:00 ERROR 9464 --- [Manager] [nio-8080-exec-2] c.s.m.exception.GlobalExceptionHandler   : Unhandled Exception: 

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:206) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at com.sigeve.manager.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:56) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:46) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:50) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1736) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at java.base/java.lang.Thread.run(Thread.java:842) ~[na:na]

2026-02-02T08:54:29.350-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [text/plain, application/json, application/*+json, */*] and supported [application/json, application/*+json]
2026-02-02T08:54:29.350-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-02-02T08:54:29.349528900, status=500, error=Internal Server Error, mess (truncated)...]
2026-02-02T08:54:29.350-03:00  WARN 9464 --- [Manager] [nio-8080-exec-2] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.]
2026-02-02T08:54:29.350-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-2] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR
2026-02-02T08:54:34.722-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.web.servlet.DispatcherServlet        : GET "/actuator/health", parameters={}
2026-02-02T08:54:34.722-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped to ResourceHttpRequestHandler [classpath [META-INF/resources/], classpath [resources/], classpath [static/], classpath [public/], ServletContext [/]]
2026-02-02T08:54:34.727-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.w.s.r.ResourceHttpRequestHandler     : Resource not found
2026-02-02T08:54:34.727-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-02-02T08:54:34.727-03:00 ERROR 9464 --- [Manager] [nio-8080-exec-3] c.s.m.exception.GlobalExceptionHandler   : Unhandled Exception: 

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:206) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at com.sigeve.manager.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:56) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:46) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:50) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1736) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at java.base/java.lang.Thread.run(Thread.java:842) ~[na:na]

2026-02-02T08:54:34.728-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [text/plain, application/json, application/*+json, */*] and supported [application/json, application/*+json]
2026-02-02T08:54:34.729-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-02-02T08:54:34.728577500, status=500, error=Internal Server Error, mess (truncated)...]
2026-02-02T08:54:34.729-03:00  WARN 9464 --- [Manager] [nio-8080-exec-3] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.]
2026-02-02T08:54:34.729-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-3] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR
2026-02-02T08:54:34.745-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.web.servlet.DispatcherServlet        : GET "/actuator/health", parameters={}
2026-02-02T08:54:34.746-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped to ResourceHttpRequestHandler [classpath [META-INF/resources/], classpath [resources/], classpath [static/], classpath [public/], ServletContext [/]]
2026-02-02T08:54:34.747-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.w.s.r.ResourceHttpRequestHandler     : Resource not found
2026-02-02T08:54:34.749-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] .m.m.a.ExceptionHandlerExceptionResolver : Using @ExceptionHandler com.sigeve.manager.exception.GlobalExceptionHandler#handleGeneralException(Exception, WebRequest)
2026-02-02T08:54:34.749-03:00 ERROR 9464 --- [Manager] [nio-8080-exec-4] c.s.m.exception.GlobalExceptionHandler   : Unhandled Exception: 

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.20.jar:6.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:206) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at com.sigeve.manager.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:56) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:46) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at com.sigeve.common.security.TenantContextFilter.doFilterInternal(TenantContextFilter.java:50) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.4.jar:6.2.4]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.6.jar:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1736) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.20.jar:10.1.20]
	at java.base/java.lang.Thread.run(Thread.java:842) ~[na:na]

2026-02-02T08:54:34.750-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Using 'application/json', given [text/plain, application/json, application/*+json, */*] and supported [application/json, application/*+json]
2026-02-02T08:54:34.751-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.w.s.m.m.a.HttpEntityMethodProcessor  : Writing [ErrorResponse[timestamp=2026-02-02T08:54:34.750661400, status=500, error=Internal Server Error, mess (truncated)...]
2026-02-02T08:54:34.751-03:00  WARN 9464 --- [Manager] [nio-8080-exec-4] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource actuator/health.]
2026-02-02T08:54:34.751-03:00 DEBUG 9464 --- [Manager] [nio-8080-exec-4] o.s.web.servlet.DispatcherServlet        : Completed 500 INTERNAL_SERVER_ERROR




log Gateway

2026-02-02T08:54:04.437-03:00  INFO 12804 --- [Gateway] [  restartedMain] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 3 endpoint(s) beneath base path '/actuator'
2026-02-02T08:54:04.514-03:00  INFO 12804 --- [Gateway] [  restartedMain] o.s.s.web.DefaultSecurityFilterChain     : Will secure any request with [org.springframework.security.web.session.DisableEncodeUrlFilter@5b04ae88, org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@56509ac3, org.springframework.security.web.context.SecurityContextHolderFilter@6dd0dc20, org.springframework.security.web.header.HeaderWriterFilter@7bc317d, org.springframework.web.filter.CorsFilter@5fd07dbe, org.springframework.security.web.authentication.logout.LogoutFilter@2068df63, com.sigeve.gateway.security.JwtAuthenticationFilter@22aaed4b, org.springframework.security.web.savedrequest.RequestCacheAwareFilter@5362e5fa, org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@1d1b500e, org.springframework.security.web.authentication.AnonymousAuthenticationFilter@f2b30fc, org.springframework.security.web.session.SessionManagementFilter@d9c6c0f, org.springframework.security.web.access.ExceptionTranslationFilter@7f2b2979, org.springframework.security.web.access.intercept.AuthorizationFilter@3c67ac69]
2026-02-02T08:54:04.997-03:00  WARN 12804 --- [Gateway] [  restartedMain] o.s.b.d.a.OptionalLiveReloadServer       : Unable to start LiveReload server
2026-02-02T08:54:05.169-03:00  INFO 12804 --- [Gateway] [  restartedMain] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 9000 (http) with context path ''
2026-02-02T08:54:05.217-03:00  INFO 12804 --- [Gateway] [  restartedMain] com.sigeve.gateway.GatewayApplication    : Started GatewayApplication in 6.996 seconds (process running for 7.86)
2026-02-02T08:54:28.883-03:00  INFO 12804 --- [Gateway] [nio-9000-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-02-02T08:54:28.883-03:00  INFO 12804 --- [Gateway] [nio-9000-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2026-02-02T08:54:28.884-03:00  INFO 12804 --- [Gateway] [nio-9000-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
2026-02-02T08:54:29.284-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-1] c.s.gateway.service.HealthCheckService   : Módulo Manager não está respondendo: 500 : "{"timestamp":"2026-02-02T08:54:29Z","status":500,"error":"Internal Server Error","message":"An unexpected error occurred","path":"/actuator/health","traceId":"9ce69177-4fc8-42c6-ae78-af99fa9d751f"}"
2026-02-02T08:54:29.286-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-1] c.s.gateway.service.HealthCheckService   : Módulo Financial não está respondendo: I/O error on GET request for "http://localhost:8081/actuator/health": Connection refused: connect
2026-02-02T08:54:29.287-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-1] c.s.gateway.service.HealthCheckService   : Módulo Production não está respondendo: I/O error on GET request for "http://localhost:8082/actuator/health": Connection refused: connect
2026-02-02T08:54:29.288-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-1] c.s.gateway.service.HealthCheckService   : Módulo Cloud não está respondendo: I/O error on GET request for "http://localhost:8083/actuator/health": Connection refused: connect
2026-02-02T08:54:29.352-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-2] c.s.gateway.service.HealthCheckService   : Módulo Manager não está respondendo: 500 : "{"timestamp":"2026-02-02T08:54:29Z","status":500,"error":"Internal Server Error","message":"An unexpected error occurred","path":"/actuator/health","traceId":"eee64639-aaf5-44a2-91d9-35fd9a7e65da"}"
2026-02-02T08:54:29.353-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-2] c.s.gateway.service.HealthCheckService   : Módulo Financial não está respondendo: I/O error on GET request for "http://localhost:8081/actuator/health": Connection refused: connect
2026-02-02T08:54:29.354-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-2] c.s.gateway.service.HealthCheckService   : Módulo Production não está respondendo: I/O error on GET request for "http://localhost:8082/actuator/health": Connection refused: connect
2026-02-02T08:54:29.355-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-2] c.s.gateway.service.HealthCheckService   : Módulo Cloud não está respondendo: I/O error on GET request for "http://localhost:8083/actuator/health": Connection refused: connect
2026-02-02T08:54:34.730-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-3] c.s.gateway.service.HealthCheckService   : Módulo Manager não está respondendo: 500 : "{"timestamp":"2026-02-02T08:54:34Z","status":500,"error":"Internal Server Error","message":"An unexpected error occurred","path":"/actuator/health","traceId":"a2540b55-7c7f-4961-a68e-3291a71fccd6"}"
2026-02-02T08:54:34.731-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-3] c.s.gateway.service.HealthCheckService   : Módulo Financial não está respondendo: I/O error on GET request for "http://localhost:8081/actuator/health": Connection refused: connect
2026-02-02T08:54:34.732-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-3] c.s.gateway.service.HealthCheckService   : Módulo Production não está respondendo: I/O error on GET request for "http://localhost:8082/actuator/health": Connection refused: connect
2026-02-02T08:54:34.733-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-3] c.s.gateway.service.HealthCheckService   : Módulo Cloud não está respondendo: I/O error on GET request for "http://localhost:8083/actuator/health": Connection refused: connect
2026-02-02T08:54:34.752-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-4] c.s.gateway.service.HealthCheckService   : Módulo Manager não está respondendo: 500 : "{"timestamp":"2026-02-02T08:54:34Z","status":500,"error":"Internal Server Error","message":"An unexpected error occurred","path":"/actuator/health","traceId":"2431fe26-0a7b-485e-a61e-416c151e3d62"}"
2026-02-02T08:54:34.753-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-4] c.s.gateway.service.HealthCheckService   : Módulo Financial não está respondendo: I/O error on GET request for "http://localhost:8081/actuator/health": Connection refused: connect
2026-02-02T08:54:34.754-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-4] c.s.gateway.service.HealthCheckService   : Módulo Production não está respondendo: I/O error on GET request for "http://localhost:8082/actuator/health": Connection refused: connect
2026-02-02T08:54:34.755-03:00  WARN 12804 --- [Gateway] [nio-9000-exec-4] c.s.gateway.service.HealthCheckService   : Módulo Cloud não está respondendo: I/O error on GET request for "http://localhost:8083/actuator/health": Connection refused: connect
org.springframework.web.client.HttpClientErrorException$Forbidden: 403 : [no body]
	at org.springframework.web.client.HttpClientErrorException.create(HttpClientErrorException.java:109)
	at org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:183)
	at org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:137)
	at org.springframework.web.client.ResponseErrorHandler.handleError(ResponseErrorHandler.java:63)
	at org.springframework.web.client.RestTemplate.handleResponse(RestTemplate.java:942)
	at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java:891)
	at org.springframework.web.client.RestTemplate.execute(RestTemplate.java:790)
	at org.springframework.web.client.RestTemplate.exchange(RestTemplate.java:701)
	at com.sigeve.gateway.service.DataSyncService.exportData(DataSyncService.java:56)
	at com.sigeve.gateway.controller.DataSyncController.exportData(DataSyncController.java:25)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.base/java.lang.reflect.Method.invoke(Method.java:568)
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:255)
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:188)
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:926)
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:831)
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87)
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089)
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979)
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014)
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914)
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:590)
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885)
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:206)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108)
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231)
	at org.springframework.security.web.ObservationFilterChainDecorator$FilterObservation$SimpleFilterObservation.lambda$wrap$1(ObservationFilterChainDecorator.java:479)
	at org.springframework.security.web.ObservationFilterChainDecorator$AroundFilterObservation$SimpleAroundFilterObservation.lambda$wrap$1(ObservationFilterChainDecorator.java:340)
	at org.springframework.security.web.ObservationFilterChainDecorator.lambda$wrapSecured$0(ObservationFilterChainDecorator.java:82)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:128)
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126)
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131)
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at com.sigeve.gateway.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:48)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107)
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90)
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82)
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240)
	at org.springframework.security.web.ObservationFilterChainDecorator$AroundFilterObservation$SimpleAroundFilterObservation.lambda$wrap$0(ObservationFilterChainDecorator.java:323)
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:224)
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137)
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233)
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191)
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113)
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195)
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113)
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74)
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230)
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352)
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:109)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:175)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:150)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344)
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391)
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63)
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1736)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63)
	at java.base/java.lang.Thread.run(Thread.java:842)
