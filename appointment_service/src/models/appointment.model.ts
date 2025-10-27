import {Entity, model, property} from '@loopback/repository';

@model({name: 'appointments', settings: {strict: true}})
export class Appointment extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'appointment_id'},
  })
  appointmentId?: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {columnName: 'patient_id'},
  })
  patientId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {columnName: 'doctor_id'},
  })
  doctorId: number;

  @property({
    type: 'string',
    required:true,
    postgresql: {columnName: 'doctor_name'}
  })
  doctorName: string;

  @property({
    type: 'date',
    required: true,
    postgresql: {columnName: 'appointment_date'},
  })
  appointmentDate: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'appointment_status'},
    default: 'Scheduled',
  })
  appointmentStatus?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'consultation_notes'},
  })
  consultationNotes?: string;

  @property({type: 'string',
    required:true,
    postgresql: {columnName: 'specialization'}
  })
  specialization?: string;
  

  @property({
    type: 'date',
    postgresql: {columnName: 'created_at'},
  })
  createdAt?: string;

  @property({
    type: 'date',
    postgresql: {columnName: 'updated_at'},
  })
  updatedAt?: string;

  constructor(data?: Partial<Appointment>) {
    super(data);
  }
}

export interface AppointmentRelations {}
export type AppointmentWithRelations = Appointment & AppointmentRelations;
