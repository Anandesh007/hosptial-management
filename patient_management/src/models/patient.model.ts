import {Entity, model, property} from '@loopback/repository';

@model({name:'patients',settings: {strict: false}})
export class Patient extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql:{columnName: 'patient_id'}
  })
  patientId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'first_name'}
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'last_name'}
  })
  lastName: string;

  @property({
    type: 'number',
    required: true,
    postgresql:{columnName: 'age'}
  })
  age: number;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'gender'}
  })
  gender: string;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'contact_number'}
  })
  contactNumber: string;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'email'}
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'address'}
  })
  address: string;

  @property({
    type: 'string',
    required: true,
    postgresql:{columnName: 'medical_history'}
  })
  medicalHistory: string;

  @property({
    type: 'date',
    required: false,
    postgresql:{columnName: 'created_at'}
  })
  createdAt: string;

  @property({
    type: 'date',
    required: false,
    postgresql:{columnName: 'updated_at'}
  })
  updatedAt: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Patient>) {
    super(data);
  }
}

export interface PatientRelations {
  // describe navigational properties here
}

export type PatientWithRelations = Patient & PatientRelations;
