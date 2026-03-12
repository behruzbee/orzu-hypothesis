import { pgTable, text, real, integer, uuid, doublePrecision } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(),
})

export const hypothesesTable = pgTable('hypotheses', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => usersTable.id),
  title: text('title'),
  description: text('description'),
  assignee: text('assignee'),
  status: text('status'),
  createdAt: doublePrecision('created_at'),
  metricName: text('metric_name'),
  targetAudience: text('target_audience'),
  pointA: real('point_a'),
  pointB: real('point_b'),
  actualPointB: real('actual_point_b'),
  resultComment: text('result_comment'),
  durationValue: integer('duration_value'),
  durationUnit: text('duration_unit'),
  priority: text('priority'),
  startedAt: doublePrecision('started_at'),
})

export const progressHistoryTable = pgTable('progress_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  hypothesisId: uuid('hypothesis_id').references(() => hypothesesTable.id, { onDelete: 'cascade' }),
  date: doublePrecision('date').notNull(),
  value: real('value').notNull(),
})