export const ENROLLMENT_STORAGE_KEY = 'spatial_ai_course_enrollments';

export const getCourseId = (course) => {
  if (!course) return '';
  if (typeof course === 'string') return course;
  return (
    course.id ||
    course.slug ||
    course.title?.toLowerCase().replace(/\s+/g, '-') ||
    ''
  );
};

export const readLocalEnrollments = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(ENROLLMENT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveLocalEnrollments = (ids) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(ids));
};

export const addLocalEnrollment = (courseId) => {
  if (!courseId) return readLocalEnrollments();
  const ids = readLocalEnrollments();
  if (!ids.includes(courseId)) {
    const updated = [...ids, courseId];
    saveLocalEnrollments(updated);
    return updated;
  }
  return ids;
};

export const removeLocalEnrollment = (courseId) => {
  if (!courseId) return readLocalEnrollments();
  const ids = readLocalEnrollments().filter((id) => id !== courseId);
  saveLocalEnrollments(ids);
  return ids;
};
