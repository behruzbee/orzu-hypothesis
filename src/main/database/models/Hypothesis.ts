import mongoose from 'mongoose'

const hypothesisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  title: String,
  description: String,
  assignee: String,
  status: String,
  createdAt: Number,
  metricName: String,
  targetAudience: String,
  pointA: Number,
  pointB: Number,
  actualPointB: Number,
  resultComment: String,
  durationValue: Number,
  durationUnit: String,
  priority: String,
  startedAt: Number,
  
  // НОВОЕ ПОЛЕ (Схема внутри схемы)
  progressHistory: [{
    id: String,
    date: Number,
    value: Number,
  }]
})

export const HypothesisModel = mongoose.model('Hypothesis', hypothesisSchema)