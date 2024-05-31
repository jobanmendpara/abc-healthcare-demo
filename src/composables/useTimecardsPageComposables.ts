import { TimecardsPageViews } from '~/types';

export function useTimecardsPageController() {
  const defaultView = TimecardsPageViews.APPROVED;
  const activeView = ref<TimecardsPageViews>(defaultView);

  const tabs: TimecardsPageViews[] = Object.values(TimecardsPageViews);

  function setView(view: TimecardsPageViews) {
    activeView.value = view;
  }

  return {
    activeView,
    setView,
    tabs,
  };
}
