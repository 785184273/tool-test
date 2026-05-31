import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).describe('用户名'),
  age: z.number().min(18).describe('年龄'),
})