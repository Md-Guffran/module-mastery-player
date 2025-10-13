import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export const ProgressBar = ({ completedLessons, totalLessons, percentage }: ProgressBarProps) => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Course Progress</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedLessons} / {totalLessons} lessons completed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={percentage} className="flex-1 h-2" />
          <span className="text-sm font-semibold min-w-[3rem] text-right">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};
