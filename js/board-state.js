/**
 * Shared mutable state object for all board modules.
 * Use boardState.X instead of module-level variables
 * to avoid circular import issues across board files.
 */
export const boardState = {
  CURRENT_TASKS: {},
  CURRENT_DRAGGED_ELEMENT: null,
  editPriority: null,
  currentSearchTerm: '',
  currentStatus: 'todo',
  renderFilteredTasks: null,
};
