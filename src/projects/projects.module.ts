import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ProjectSchema } from './schemas/project.shema';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsController } from './projects.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketSchema } from '../tickets/schemas/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Project', schema: ProjectSchema },
      { name: 'Ticket', schema: TicketSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    forwardRef(() => TicketsModule),
  ],
  exports: [ProjectsService],
  providers: [ProjectsService, ProjectsResolver],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
