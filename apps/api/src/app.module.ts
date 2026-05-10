import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { PostsModule } from './posts/posts.module';
import { LeadsModule } from './leads/leads.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { TicketsModule } from './tickets/tickets.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    AuthModule,
    UploadsModule,
    PostsModule,
    LeadsModule,
    CustomersModule,
    InvoicesModule,
    TicketsModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
