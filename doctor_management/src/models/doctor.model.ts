import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'doctors',
  settings: {strict: true},
})
export class Doctor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'doctor_id'},
  })
  doctorId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'first_name'},
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'last_name'},
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'specialization'},
  })
  specialization: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'contact_number'},
  })
  contactNumber?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'email'},
  })
  email?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'available_days'},
  })
  availableDays?: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'consultation_fee'},
  })
  consultationFee?: number;

  @property({
    type: 'date',
    required: false,
    postgresql: {columnName: 'created_at'},
  })
  createdAt?: string;

  @property({
    type: 'date',
    required: false,
    postgresql: {columnName: 'updated_at'},
  })
  updatedAt?: string;

  // Indexer to allow extra properties if needed
  [prop: string]: any;

  constructor(data?: Partial<Doctor>) {
    super(data);
  }
}

export interface DoctorRelations {
  // describe navigational properties here
}
export type DoctorWithRelations = Doctor & DoctorRelations;
