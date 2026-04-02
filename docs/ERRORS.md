PS C:\Users\kiria\Desktop\fullstack\shopping_mall> yarn nx serve backend

> nx run @shopping-mall/backend:serve:development

> nx run @shopping-mall/backend:build:development

> nx run @shopping-mall/backend:serve:watch

ERROR (1) when writing 
EPERM: operation not permitted, rename 'C:\Users\kiria\Desktop\fullstack\shopping_mall\.nx\workspace-data\source-maps.json~2c159d89' -> 'C:\Users\kiria\Desktop\fullstack\shopping_mall\.nx\workspace-data\source-maps.json'
Error: EPERM: operation not permitted, rename 'C:\Users\kiria\Desktop\fullstack\shopping_mall\.nx\workspace-data\source-maps.json~2c159d89' -> 'C:\Users\kiria\Desktop\fullstack\shopping_mall\.nx\workspace-data\source-maps.json'
    at renameSync (node:fs:1033:11)
    at writeCache (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\project-graph\nx-deps-cache.js:157:38)
    at buildProjectGraphAndSourceMapsWithoutDaemon (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\project-graph\project-graph.js:130:40)       
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) 
    at async createProjectGraphAndSourceMapsAsync (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\project-graph\project-graph.js:271:25)        
    at async createProjectGraphAsync (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\project-graph\project-graph.js:219:39)
    at async syncGenerator (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\@nx\js\src\generators\typescript-sync\typescript-sync.js:35:26)
    at async runSyncGenerator (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\utils\sync-generators.js:71:24)
    at async runSyncGenerators (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\utils\sync-generators.js:241:24)
    at async getSyncGeneratorChanges (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\nx\src\utils\sync-generators.js:39:19)

 NX   Running target build for project @shopping-mall/backend and 2 tasks it depends on:



> nx run @shopping-mall/shared:build  [local cache]


> nx run @shopping-mall/mocks:build  [local cache]


> nx run @shopping-mall/backend:build:development  [local cache]

> webpack-cli build --node-env=development

chunk (runtime: main) main.js (main) 456 KiB [entry] [rendered]
webpack compiled successfully (9de2e8f8dfe99455)



 NX   Successfully ran target build for project @shopping-mall/backend and 2 tasks it depends on

Nx read the output from the cache instead of running the command for 3 out of 3 tasks.


> nx run @shopping-mall/backend:"serve:watch"

> nx run @shopping-mall/backend:build:watch

> nx run @shopping-mall/backend:serve:node:watch


 NX   Nx Cloud encountered some problems

This workspace is more than three days old and is not connected. Workspaces must be connected within 3 days of creation. Claim your workspace at https://cloud.nx.app


> nx run @shopping-mall/backend:"serve:node:watch"

> wait-on dist/main.js -t 60000 && node watch-server.js


> nx run @shopping-mall/backend:"build:watch"

> webpack-cli build --node-env=development --watch

Starting server...
Watching for file changes...
Restarting server...
Starting server...
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [NestFactory] Starting Nest application...
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] TypeOrmModule dependencies initialized +72ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] HttpModule dependencies initialized +1ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] ConfigModule dependencies initialized +4ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] EventEmitterModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] ScheduleModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] RedisModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] JwtModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] CommonModule dependencies initialized +1ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:30     LOG [InstanceLoader] EmailModule dependencies initialized +0ms
(node:16808) DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead.
(Use `node --trace-deprecation ...` to show where the warning was created)        
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +176ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31     LOG [InstanceLoader] AppModule dependencies initialized +4ms
[Nest] 16808  - 2026. 04. 02. 오전 12:34:31   ERROR [ExceptionHandler] UnknownDependenciesException [Error]: Nest can't resolve dependencies of the JwtAuthGuard (?). Please make sure that the argument AuthService at index [0] is available in the AuditModule module.

Potential solutions:
- Is AuditModule a valid NestJS module?
- If AuthService is a provider, is it part of the current AuditModule?
- If AuthService is exported from a separate @Module, is that module imported within AuditModule?
  @Module({
    imports: [ /* the Module containing AuthService */ ]
  })

For more common dependency resolution issues, see: https://docs.nestjs.com/faq/common-errors
    at Injector.lookupComponentInParentModules (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\injector.js:290:19)       
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) 
    at async resolveParam (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\injector.js:140:38)
    at async Promise.all (index 0)
    at async Injector.resolveConstructorParams (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\injector.js:169:27)       
    at async Injector.loadInstance (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\injector.js:75:13)
    at async Injector.loadInjectable (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\injector.js:99:9)
    at async C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\instance-loader.js:80:13
    at async Promise.all (index 0)
    at async InstanceLoader.createInstancesOfInjectables (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\node_modules\@nestjs\core\injector\instance-loader.js:79:9) {
  type: 'JwtAuthGuard',
  context: {
    index: 0,
    dependencies: [
      [class AuthService]
    ],
    name: [class AuthService]
  },
  metadata: {
    id: '3985dc8b92c57d4102e6a'
  },
  moduleRef: {
    id: 'f1188df3adab348ff78c7'
  }
}
