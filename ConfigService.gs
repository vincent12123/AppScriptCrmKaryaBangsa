// ============================================================
// CRM SPMB - Config Service
// Milestone 4
// ============================================================

const ConfigService = {
  getConfig: function() {
    const refs = getReferenceColumns();
    const user = AuthService.getCurrentUser();
    return {
      user: user,
      scope: {
        picName: AuthService.getScopedPicOptionName(user) || AuthService.getScopedPicName(user),
        lifecycle: AuthService.canViewArchived(user) ? ['active', 'archived', 'all'] : ['active']
      },
      permissions: {
        canWrite: AuthService.canWrite(user),
        canArchive: AuthService.canWrite(user),
        canRestore: AuthService.canManage(user),
        canEdit: AuthService.canWrite(user),
        canReschedule: AuthService.canWrite(user),
        canSendReminder: AuthService.canSendReminder(user),
        canImport: AuthService.canImport(user),
        canExport: AuthService.canExport(user),
        canViewArchived: AuthService.canViewArchived(user)
      },
      statuses: refs.statuses,
      jurusans: refs.jurusans,
      sumbers: refs.sumbers,
      prioritas: refs.prioritas,
      arahs: refs.arahs,
      pics: refs.pics
    };
  }
};
