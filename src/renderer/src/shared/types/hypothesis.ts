export enum HypothesisStatus {
  IDEAS = 'ideas',
  READY = 'ready',
  PROGRESS = 'progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  DISCUSS = 'discuss'
}

export type HypothesisPriority = 'low' | 'medium' | 'high'

export interface ProgressRecord {
  id: string
  date: number
  value: number
}

export interface Hypothesis {
  id: string
  title: string
  description?: string
  assignee?: string
  status: HypothesisStatus
  createdAt: number
  metricName?: string
  targetAudience?: string
  pointA?: number
  pointB?: number
  durationDays?: number
  startedAt?: number
  durationValue?: number
  durationUnit?: 'hours' | 'days'
  actualPointB?: number;
  resultComment?: string; 
  priority?: HypothesisPriority
  progressHistory?: ProgressRecord[] 
}
