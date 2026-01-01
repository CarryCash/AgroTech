import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    iconColor = 'text-accent',
}) => {
    return (
        <div className={cn('stat-card group hover:scale-[1.02] transition-transform duration-300', className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-display font-bold text-foreground">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            'flex items-center gap-1 mt-2 text-sm',
                            trend.isPositive ? 'text-success' : 'text-destructive'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-muted-foreground">vs mes anterior</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6',
                    'bg-gradient-to-br from-primary/20 to-accent/20'
                )}>
                    <Icon className={cn('w-6 h-6', iconColor)} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
