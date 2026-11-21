import { Module, MiddlewareConsumer } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RequestsModule } from './requests/requests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RequestIdMiddleware } from './common/request-id.middleware';

@Module({
  imports: [
    StorageModule,
    AuthModule,
    CategoriesModule,
    RequestsModule,
    DashboardModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*'); // Applies the request ID logger to all routes
  }
}