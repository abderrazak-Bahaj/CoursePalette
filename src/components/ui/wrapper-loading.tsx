import { ReactNode } from 'react';
import { Loader } from './loader';

interface WrapperLoadingProps {
  children: ReactNode;
  isLoading: boolean;
}

const WrapperLoading = ({ children, isLoading }: WrapperLoadingProps) => {
  return (
    <div className="relative">
      {isLoading && <Loader fullPage />}
      {children}
    </div>
  );
};

export default WrapperLoading;
