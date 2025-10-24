import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class DoctorLeave extends Entity {
  // Define well-known properties here
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  doctorId: number;

  @property({
    type: 'string',
    required: true,
  })
  leaveDate: string; // e.g., '2025-10-25'

  @property({
    type: 'string',
  })
  reason?: string;
  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<DoctorLeave>) {
    super(data);
  }
}

export interface DoctorLeaveRelations {
  // describe navigational properties here
}

export type DoctorLeaveWithRelations = DoctorLeave & DoctorLeaveRelations;
