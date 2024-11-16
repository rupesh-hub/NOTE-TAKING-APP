import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProjectService } from '../../features/services/project.service';

export const projectInterceptor: HttpInterceptorFn = (req, next) => {
  const projectService = inject(ProjectService);
  const projectId = projectService.activeProjectId(); 
  
  if (projectId) {
    const clonedRequest = req.clone({
      setHeaders: { 'x-project-id': projectId }
    });
    return next(clonedRequest);
  }
  
  return next(req);
};