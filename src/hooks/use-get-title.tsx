import { useLocation } from 'react-router-dom';

export const useGetTitle = () => {
  const location = useLocation();
  const path = location.pathname;

  const titles = {};

  return {
    title: titles?.[path] || 'Home',
    path: location.pathname,
  };
};
