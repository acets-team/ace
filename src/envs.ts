import { Enums, type InferEnums } from './fundamentals/enums'


export const envs = new Enums(['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'JWT_SECRET', 'EVENTS_AUTH_TOKEN', 'BREVO_API_KEY'])
export type Envs = InferEnums<typeof envs>
