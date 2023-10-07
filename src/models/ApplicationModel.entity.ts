import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ApplicationModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  data: string;
}
