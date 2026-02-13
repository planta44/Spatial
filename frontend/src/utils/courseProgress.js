export const COURSE_PROGRESS_KEY = 'spatial_ai_course_progress';

export const readCourseProgress = () => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(COURSE_PROGRESS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

export const saveCourseProgress = (data) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(data || {}));
};

export const getCourseProgress = (courseId) => {
  if (!courseId) return { completedModules: [], updatedAt: null };
  const allProgress = readCourseProgress();
  const entry = allProgress[String(courseId)];
  if (!entry || typeof entry !== 'object') {
    return { completedModules: [], updatedAt: null };
  }
  return {
    completedModules: Array.isArray(entry.completedModules)
      ? entry.completedModules.map(String)
      : [],
    updatedAt: entry.updatedAt || null,
  };
};

export const isModuleComplete = (courseId, moduleId) => {
  if (!courseId || !moduleId) return false;
  const entry = getCourseProgress(courseId);
  return entry.completedModules.includes(String(moduleId));
};

export const markModuleComplete = (courseId, moduleId) => {
  if (!courseId || !moduleId) return getCourseProgress(courseId);
  const allProgress = readCourseProgress();
  const current = getCourseProgress(courseId);
  const completed = new Set(current.completedModules || []);
  completed.add(String(moduleId));
  const nextEntry = {
    completedModules: Array.from(completed),
    updatedAt: new Date().toISOString(),
  };
  const nextProgress = {
    ...allProgress,
    [String(courseId)]: nextEntry,
  };
  saveCourseProgress(nextProgress);
  return nextEntry;
};

export const clearCourseProgress = (courseId) => {
  if (!courseId) return;
  const allProgress = readCourseProgress();
  if (!allProgress || typeof allProgress !== 'object') return;
  if (!Object.prototype.hasOwnProperty.call(allProgress, String(courseId))) return;
  const nextProgress = { ...allProgress };
  delete nextProgress[String(courseId)];
  saveCourseProgress(nextProgress);
};

export const getCompletionProgress = (courseId, totalModules = 0) => {
  const entry = getCourseProgress(courseId);
  const completedCount = entry.completedModules.length;
  if (!totalModules) {
    return { completedCount, totalModules, percent: 0 };
  }
  const percent = Math.min(100, Math.round((completedCount / totalModules) * 100));
  return { completedCount, totalModules, percent };
};
