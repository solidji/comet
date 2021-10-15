require('dotenv-safe').config();
import { MikroORM } from '@mikro-orm/core'
import { mikroOrmConf } from '@/config/mikro-orm.config'
;(async () => {
  const orm = await MikroORM.init(mikroOrmConf)

  const migrator = orm.getMigrator()
  if(process.env.MIGRATE_INITIAL === 'true')
    await migrator.createInitialMigration()
  else {
    console.log("🚀 ~ file: migrate.ts ~ line 8 ~ ; ~ createMigration")
    await migrator.createMigration()
  }
  await migrator.up()
  await orm.close(true)
  process.exit(0)
})()
