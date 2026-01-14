# Troubleshooting - Tax Situations Backend

## Problema Atual
**Erro**: "No static resource tax-situations"

## 🚨 **ERRO 403 FORBIDDEN IDENTIFICADO**

Se você está recebendo **status 403**, significa que:
- ✅ **Backend está rodando** na porta 8080
- ✅ **Rota está mapeada** corretamente  
- ✅ **URLs estão corretas** (sem /api)
- ❌ **Acesso negado por autorização** (não CORS)

### **Problema Real: Autorização/Segurança**

Como vocês têm uma **URL de permissão no backend mas está desabilitada**, o problema é de **autorização**, não CORS.

### **Solução para Problema de Autorização**

#### 1. **Configuração de Segurança no Backend**
Se estiver usando Spring Security, configure para permitir acesso temporário:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/tax-situations/**").permitAll()  // ✅ Permite acesso sem autenticação
                .anyRequest().authenticated();
        
        return http.build();
    }
}
```

#### 2. **Ou desabilitar temporariamente a segurança**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests()
                .anyRequest().permitAll();  // ✅ Permite tudo temporariamente
        
        return http.build();
    }
}
```

#### 3. **Ou usar @PreAuthorize no Controller**
```java
@RestController
@RequestMapping("/tax-situations")
public class TaxSituationController {
    
    @GetMapping
    @PreAuthorize("permitAll()")  // ✅ Permite acesso sem autenticação
    public ResponseEntity<List<TaxSituationDTO>> getAll() {
        // implementação
    }
}
```

## Diagnóstico

### 1. **Verificar se o Backend está Rodando**
```bash
# Verificar se há algum processo na porta 8080
netstat -an | findstr :8080

# Ou usar o comando do PowerShell
Get-NetTCPConnection -LocalPort 8080
```

### 2. **Testar Endpoint de Health Check**
```bash
# Testar se o Spring Boot está respondendo
curl http://localhost:8080/actuator/health

# Se não funcionar, tentar sem o actuator
curl http://localhost:8080/
```

### 3. **Verificar Controller no Backend**
O controller deve estar configurado assim:
```java
@RestController
@RequestMapping("/tax-situations")  // SEM prefixo /api
public class TaxSituationController {
    
    @GetMapping
    public ResponseEntity<List<TaxSituationDTO>> getAll() {
        // implementação
    }
    
    @PostMapping
    public ResponseEntity<TaxSituationDTO> create(@RequestBody TaxSituationDTO dto) {
        // implementação
    }
    
    // outros métodos CRUD...
}
```

### 4. **Verificar Configuração do Spring Boot**
No `application.properties` ou `application.yml`:
```properties
# Porta do servidor
server.port=8080

# CORS habilitado
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE
spring.web.cors.allowed-headers=*

# Logs para debug
logging.level.org.springframework.web=DEBUG
logging.level.com.seu.pacote=DEBUG
```

## Soluções

### **Solução 1: Verificar se o Backend está Rodando**
1. Abra o terminal na pasta do projeto backend
2. Execute: `mvn spring-boot:run` ou `./mvnw spring-boot:run`
3. Verifique se não há erros de compilação
4. Confirme que está rodando na porta 8080

### **Solução 2: Verificar Mapeamento das Rotas**
1. No backend, verifique se o controller está sendo carregado
2. Procure por logs como: "Mapped ... onto ..."
3. Verifique se não há conflitos de rota

### **Solução 3: Testar com Postman/Insomnia**
1. Abra o Postman
2. Faça uma requisição GET para: `http://localhost:8080/tax-situations`
3. Verifique a resposta

### **Solução 4: Verificar CORS**
Se o problema for CORS, adicione no backend:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## Como Testar no Frontend

### 1. **Acesse a Página**
- Navegue para: `/referenciais/tax-situations`
- Abra o console do navegador (F12)

### 2. **Use o Botão de Teste**
- Clique no botão "🧪 Testar Backend"
- Verifique o status retornado

### 3. **Verifique os Logs**
- Console do navegador deve mostrar logs detalhados
- Network tab deve mostrar as requisições

## Status Esperado

✅ **Backend Rodando**: Porta 8080 ativa
✅ **Controller Mapeado**: Rota `/tax-situations` funcionando
✅ **CORS Configurado**: Frontend consegue acessar
✅ **Endpoint Respondendo**: GET `/tax-situations`

## 🧪 **Testes Específicos para Erro 403 de Autorização**

### **1. Teste com Frontend**
- Use o botão "🔍 Testar Endpoint" na página
- Verifique o console para logs detalhados
- Analise as respostas de GET, OPTIONS, POST e GET com token

### **2. Teste com Postman/Insomnia**
1. **GET Request**: `http://localhost:8080/tax-situations`
2. **Headers**: 
   - `Accept: application/json`
   - `Content-Type: application/json`
3. **Verifique**: Status, Headers de resposta

### **3. Teste de Autorização**
```bash
# Teste sem token
curl -v http://localhost:8080/tax-situations

# Teste com token (se aplicável)
curl -H "Authorization: Bearer seu-token" \
     -H "Accept: application/json" \
     -v http://localhost:8080/tax-situations
```

## 📋 **Checklist para Resolver Erro 403 de Autorização**

- [x] **Backend rodando** na porta 8080
- [x] **Controller mapeado** com `@RequestMapping("/tax-situations")`
- [x] **URLs configuradas** corretamente (sem /api)
- [ ] **Spring Security** permitindo acesso temporário
- [ ] **Permissões configuradas** para `/tax-situations/**`
- [ ] **Autenticação desabilitada** temporariamente (se necessário)

## 🎯 **Soluções Prioritárias**

### **Solução 1: Permitir acesso temporário (Recomendado)**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/tax-situations/**").permitAll()  // ✅ Permite acesso
                .anyRequest().authenticated();
        
        return http.build();
    }
}
```

### **Solução 2: Desabilitar segurança temporariamente**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests()
                .anyRequest().permitAll();  // ✅ Permite tudo
        
        return http.build();
    }
}
```

## 🚀 **Próximos Passos**

1. **Implemente uma das soluções** de autorização no backend
2. **Reinicie o servidor** Spring Boot
3. **Teste novamente** com o botão "🔍 Testar Endpoint"
4. **Verifique se o status** mudou de 403 para 200
5. **Quando implementar autorizações**, configure as permissões adequadas

## 💡 **Dica Importante**

Como vocês têm uma **URL de permissão desabilitada**, a solução é **temporariamente permitir acesso** ao endpoint `/tax-situations/**` até que o sistema de autorizações esteja implementado.
