import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ApplicationModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  data: string;
}
