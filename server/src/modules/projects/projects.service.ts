/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMemberRole } from '../../common/enums/project-member-role.enum';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UsersService } from '../users/users.service';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectMember } from './entities/project-member.entity';
import { Project } from './entities/project.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    private readonly usersService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(createProjectDto: CreateProjectDto, currentUser: AuthUser) {
    const project = this.projectsRepository.create({
      title: createProjectDto.title,
      description: createProjectDto.description,
      createdById: currentUser.sub,
    });

    const savedProject = await this.projectsRepository.save(project);

    const ownerMembership = this.projectMembersRepository.create({
      projectId: savedProject.id,
      userId: currentUser.sub,
      role: ProjectMemberRole.ADMIN,
    });

    await this.projectMembersRepository.save(ownerMembership);

    await this.activityLogsService.create({
      action: `Created project ${savedProject.title}`,
      performedById: currentUser.sub,
      projectId: savedProject.id,
    });

    const fullProject = await this.projectsRepository.findOne({
      where: { id: savedProject.id },
      relations: {
        createdBy: true,
        members: { user: true },
      },
    });

    return {
      success: true,
      message: 'Project created successfully',
      data: fullProject,
    };
  }

  async findAll(currentUser: AuthUser) {
    if (currentUser.role === UserRole.ADMIN) {
      const projects = await this.projectsRepository.find({
        relations: {
          createdBy: true,
          members: { user: true },
        },
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        message: 'Projects fetched successfully',
        data: projects,
      };
    }

    const memberships = await this.projectMembersRepository.find({
      where: { userId: currentUser.sub },
      relations: {
        project: {
          createdBy: true,
          members: { user: true },
        },
      },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Projects fetched successfully',
      data: memberships.map((membership) => membership.project),
    };
  }

  async findOne(projectId: number, currentUser: AuthUser) {
    if (currentUser.role === UserRole.ADMIN) {
      const project = await this.projectsRepository.findOne({
        where: { id: projectId },
        relations: {
          createdBy: true,
          members: { user: true },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return {
        success: true,
        message: 'Project fetched successfully',
        data: project,
      };
    }

    const membership = await this.projectMembersRepository.findOne({
      where: {
        projectId,
        userId: currentUser.sub,
      },
      relations: {
        project: {
          createdBy: true,
          members: { user: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Project not found');
    }

    return {
      success: true,
      message: 'Project fetched successfully',
      data: membership.project,
    };
  }

  async update(
    projectId: number,
    updateProjectDto: UpdateProjectDto,
    currentUser: AuthUser,
  ) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    Object.assign(project, updateProjectDto);
    await this.projectsRepository.save(project);

    await this.activityLogsService.create({
      action: `Updated project ${project.title}`,
      performedById: currentUser.sub,
      projectId: project.id,
    });

    const updatedProject = await this.projectsRepository.findOne({
      where: { id: project.id },
      relations: {
        createdBy: true,
        members: { user: true },
      },
    });

    return {
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    };
  }

  async remove(projectId: number, currentUser: AuthUser) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectsRepository.softDelete(projectId);

    await this.activityLogsService.create({
      action: `Deleted project ${project.title}`,
      performedById: currentUser.sub,
      projectId: project.id,
    });

    return {
      success: true,
      message: 'Project deleted successfully',
      data: null,
    };
  }

  async addMember(
    projectId: number,
    addProjectMemberDto: AddProjectMemberDto,
    currentUser: AuthUser,
  ) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.usersService.findById(addProjectMemberDto.userId);

    const existingMembership = await this.projectMembersRepository.findOne({
      where: {
        projectId,
        userId: addProjectMemberDto.userId,
      },
    });

    await this.notificationsService.create(
      addProjectMemberDto.userId,
      `You were added to project ${project.title}`,
    );


    if (existingMembership) {
      throw new ConflictException('User is already a member of this project');
    }

    const membership = this.projectMembersRepository.create({
      projectId,
      userId: addProjectMemberDto.userId,
      role: addProjectMemberDto.role ?? ProjectMemberRole.MEMBER,
    });

    await this.projectMembersRepository.save(membership);

    await this.activityLogsService.create({
      action: `Added ${user.name} to project ${project.title}`,
      performedById: currentUser.sub,
      projectId,
    });

    return {
      success: true,
      message: 'Project member added successfully',
      data: null,
    };
  }

  async removeMember(projectId: number, userId: number, currentUser: AuthUser) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.createdById === userId) {
      throw new BadRequestException('Project creator cannot be removed');
    }

    const membership = await this.projectMembersRepository.findOne({
      where: {
        projectId,
        userId,
      },
      relations: {
        user: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Project member not found');
    }

    await this.projectMembersRepository.remove(membership);

    await this.activityLogsService.create({
      action: `Removed ${membership.user.name} from project ${project.title}`,
      performedById: currentUser.sub,
      projectId,
    });

    return {
      success: true,
      message: 'Project member removed successfully',
      data: null,
    };
  }
}
