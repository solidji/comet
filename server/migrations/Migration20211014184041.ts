import { Migration } from '@mikro-orm/migrations';

export class Migration20211014184041 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "event" ("id" bigserial primary key, "created_at" timestamptz(0) not null, "title" text not null, "description" text null, "owner_id" bigint not null, "images" jsonb not null, "banner_url" text null, "is_deleted" bool not null, "is_public" bool not null, "server_id" bigint not null, "updated_at" timestamptz(0) null);');

    this.addSql('create table "event_user" ("user_id" bigint not null, "event_id" bigint not null, "position" text not null, "created_at" timestamptz(0) not null, "event_jobs" text check ("event_jobs" in (\'None\', \'Moderator\', \'Collaborator\')) not null);');
    this.addSql('alter table "event_user" add constraint "event_user_pkey" primary key ("user_id", "event_id");');

    this.addSql('alter table "event" add constraint "event_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "event" add constraint "event_server_id_foreign" foreign key ("server_id") references "server" ("id") on update cascade;');

    this.addSql('alter table "event_user" add constraint "event_user_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "event_user" add constraint "event_user_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');
  }

}
