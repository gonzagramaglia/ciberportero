// Re-export all actions from modular files for backwards compatibility.
// New code should import directly from '@/lib/actions/<module>'.
export {
  logAction,
  deleteLink, createPersonalLink, deletePersonalLink, upsertLink, reorderLink,
  toggleNotification, deleteNotification, upsertNotification,
  deletePost, upsertPost, votePost,
  deletePodcast, upsertPodcast, votePodcast,
  toggleCountdown, upsertCountdown, swapCountdowns,
  deleteCalendarEvent, upsertCalendarEvent, createPersonalEvent,
  getUserProgress, updateUserProgress,
  getComments, addComment, deleteComment,
  uploadImage, getImages, deleteImage,
  getAdminNote, updateAdminSectionNote, getUsers, updateUserRole,
} from './actions/index';
