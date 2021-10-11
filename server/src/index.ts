import 'reflect-metadata'
require('dotenv-safe').config();
import checkEnv from '@/util/checkEnv'
import { bootstrap } from '@/bootstrap'

checkEnv()
bootstrap().catch(console.error)
