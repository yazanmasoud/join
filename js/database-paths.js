export function userPath(uid) {
  return `users/${uid}`;
}


export function userProfilePath(uid) {
  return `${userPath(uid)}/profile`;
}


export function userContactsPath(uid) {
  return `${userPath(uid)}/contacts`;
}


export function userContactPath(uid, contactId) {
  return `${userContactsPath(uid)}/${contactId}`;
}


export function userTasksPath(uid) {
  return `${userPath(uid)}/tasks`;
}


export function userTaskPath(uid, taskId) {
  return `${userTasksPath(uid)}/${taskId}`;
}


export function userSubtaskPath(uid, taskId, subtaskIndex) {
  return `${userTaskPath(uid, taskId)}/subtasks/${subtaskIndex}`;
}
