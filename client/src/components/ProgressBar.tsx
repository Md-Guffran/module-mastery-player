import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export const ProgressBar = ({ completedLessons, totalLessons, percentage }: ProgressBarProps) => {
  return (
    <div className="bg-card border-b border-border p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-success" />
            <span className="text-xs md:text-sm font-medium">Course Progress</span>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground">
            {completedLessons} / {totalLessons} lessons completed
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Progress value={percentage} className="flex-1 h-2" />
          <span className="text-xs md:text-sm font-semibold min-w-[2.5rem] md:min-w-[3rem] text-right">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};
