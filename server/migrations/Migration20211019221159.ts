import { Migration } from '@mikro-orm/migrations';

export class Migration20211019221159 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "event" add column "user_count" int4 not null;');

    this.addSql('alter table "event_user" add column "status" text check ("status" in (\'None\', \'Joined\', \'Banned\')) not null;');
    this.addSql('alter table "event_user" drop constraint if exists "event_user_event_job_check";');
    this.addSql('alter table "event_user" alter column "event_job" type text using ("event_job"::text);');
    this.addSql('alter table "event_user" add constraint "event_user_event_job_check" check ("event_job" in (\'None\', \'Member\', \'Moderator\', \'Collaborator\'));');
  }

}
