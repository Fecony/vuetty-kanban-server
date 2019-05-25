import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ProjectSchema } from './schemas/project.shema';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
  ],
  providers: [ProjectsService, ProjectsResolver],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
