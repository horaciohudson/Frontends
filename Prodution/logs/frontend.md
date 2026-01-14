🚀 Navegando para: /custos-producao
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: 
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: 
ProductionCostsPage.tsx:36 🏢 [PRODUCTION COSTS] Loading companies...
ProductionCostsPage.tsx:36 🏢 [PRODUCTION COSTS] Loading companies...
ProductionCostsPage.tsx:47 🏢 [PRODUCTION COSTS] Using first company ID: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:43 🏢 [PRODUCTION COSTS] Using saved company ID: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:65 💰 [PRODUCTION COSTS] Company selected, loading data for: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:82 🏭 [PRODUCTION COSTS] Loading production orders for company: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
productionOrderService.ts:71 📋 ProductionOrderService - Buscando ordens de produção...
ProductionCostsPage.tsx:97 💰 [PRODUCTION COSTS] Loading costs for company: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:111 💰 [PRODUCTION COSTS] Loading all costs using findAll...
productionCostService.ts:17 💰 [PRODUCTION COST SERVICE] Calling findAll with page: 0 size: 1000
productionCostService.ts:18 💰 [PRODUCTION COST SERVICE] User tenant: dc7fa6cd-9723-4fa9-a570-fcf364690aae
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
productionOrderService.ts:91 ✅ ProductionOrderService - Ordens carregadas: 1
ProductionCostsPage.tsx:85 ✅ [PRODUCTION COSTS] Production orders loaded: 1 orders
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
productionCostService.ts:22   GET http://localhost:8080/api/production-costs/paged?page=0&size=1000 400 (Bad Request)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
findAll @ productionCostService.ts:22
loadCosts @ ProductionCostsPage.tsx:113
(anonymous) @ ProductionCostsPage.tsx:67
react_stack_bottom_frame @ react-dom-client.development.js:25989
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:13249
commitHookPassiveMountEffects @ react-dom-client.development.js:13336
commitPassiveMountOnFiber @ react-dom-client.development.js:15484
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15519
flushPassiveEffects @ react-dom-client.development.js:18432
(anonymous) @ react-dom-client.development.js:17923
performWorkUntilDeadline @ scheduler.development.js:45
productionCostService.ts:31  💰 [PRODUCTION COST SERVICE] Paged endpoint failed, trying simple endpoint: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
findAll @ productionCostService.ts:31
await in findAll
loadCosts @ ProductionCostsPage.tsx:113
(anonymous) @ ProductionCostsPage.tsx:67
react_stack_bottom_frame @ react-dom-client.development.js:25989
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:13249
commitHookPassiveMountEffects @ react-dom-client.development.js:13336
commitPassiveMountOnFiber @ react-dom-client.development.js:15484
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15519
flushPassiveEffects @ react-dom-client.development.js:18432
(anonymous) @ react-dom-client.development.js:17923
performWorkUntilDeadline @ scheduler.development.js:45
productionCostService.ts:34   GET http://localhost:8080/api/production-costs 403 (Forbidden)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
findAll @ productionCostService.ts:34
await in findAll
loadCosts @ ProductionCostsPage.tsx:113
(anonymous) @ ProductionCostsPage.tsx:67
react_stack_bottom_frame @ react-dom-client.development.js:25989
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:13249
commitHookPassiveMountEffects @ react-dom-client.development.js:13336
commitPassiveMountOnFiber @ react-dom-client.development.js:15484
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15519
flushPassiveEffects @ react-dom-client.development.js:18432
(anonymous) @ react-dom-client.development.js:17923
performWorkUntilDeadline @ scheduler.development.js:45
productionCostService.ts:53  💥 [PRODUCTION COST SERVICE] Error in findAll: AxiosError {message: 'Request failed with status code 403', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
findAll @ productionCostService.ts:53
await in findAll
loadCosts @ ProductionCostsPage.tsx:113
(anonymous) @ ProductionCostsPage.tsx:67
react_stack_bottom_frame @ react-dom-client.development.js:25989
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:13249
commitHookPassiveMountEffects @ react-dom-client.development.js:13336
commitPassiveMountOnFiber @ react-dom-client.development.js:15484
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15476
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15718
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:15439
commitPassiveMountOnFiber @ react-dom-client.development.js:15519
flushPassiveEffects @ react-dom-client.development.js:18432
(anonymous) @ react-dom-client.development.js:17923
performWorkUntilDeadline @ scheduler.development.js:45
ProductionCostsPage.tsx:115 💰 [PRODUCTION COSTS] Loaded costs from findAll: 0 costs
ProductionCostsPage.tsx:116 💰 [PRODUCTION COSTS] Sample cost data: No data
ProductionCostsPage.tsx:163 ✅ [PRODUCTION COSTS] Costs loaded and filtered: 0 costs
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41
ProductionCostsPage.tsx:30 💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId: c0fe9fd2-07c3-4369-836f-d9d38cfdbe41