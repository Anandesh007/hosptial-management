import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  HttpErrors,
  requestBody,
  response,
} from '@loopback/rest';
import {Doctor} from '../models';
import {DoctorRepository,DoctorLeaveRepository,AppointmentRepository} from '../repositories';

export class DoctorController {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
    @repository(DoctorLeaveRepository)
    public doctorLeaveRepo: DoctorLeaveRepository,
    @repository(AppointmentRepository)
    public appointmentRepo: AppointmentRepository,
  ) {}

  // 🔹 CREATE Doctor
  @post('/doctors')
  @response(200, {
    description: 'Doctor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Doctor)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doctor, {
            title: 'NewDoctor',
            exclude: ['doctorId', 'createdAt', 'updatedAt'],
          }),
        },
      },
    })
    doctor: Omit<Doctor, 'doctorId'>,
  ): Promise<Doctor> {
    const now = new Date();
    doctor['createdAt'] = now;
    doctor['updatedAt'] = now;
    return this.doctorRepository.create(doctor);
  }

  // 🔹 COUNT
  @get('/doctors/count')
  @response(200, {
    description: 'Doctor model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Doctor) where?: Where<Doctor>): Promise<Count> {
    return this.doctorRepository.count(where);
  }

  // 🔹 FIND all Doctors
  @get('/doctors')
  @response(200, {
    description: 'Array of Doctor model instances',
    content: {
      'application/json': {
        schema: {type: 'array', items: getModelSchemaRef(Doctor, {includeRelations: true})},
      },
    },
  })
  async find(@param.filter(Doctor) filter?: Filter<Doctor>): Promise<Doctor[]> {
    return this.doctorRepository.find(filter);
  }

  // 🔹 FIND by ID
  @get('/doctors/{id}')
  @response(200, {
    description: 'Doctor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Doctor, {includeRelations: true})}},
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Doctor, {exclude: 'where'}) filter?: FilterExcludingWhere<Doctor>,
  ): Promise<Doctor> {
    return this.doctorRepository.findById(id, filter);
  }

  // 🔹 UPDATE (Partial)
  @patch('/doctors/{id}')
  @response(204, {description: 'Doctor PATCH success'})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {'application/json': {schema: getModelSchemaRef(Doctor, {partial: true})}},
    })
    doctor: Doctor,
  ): Promise<void> {
    doctor['updated_at'] = new Date();
    await this.doctorRepository.updateById(id, doctor);
  }

  // 🔹 REPLACE (Full)
  @put('/doctors/{id}')
  @response(204, {description: 'Doctor PUT success'})
  async replaceById(@param.path.number('id') id: number, @requestBody() doctor: Doctor): Promise<void> {
    doctor['updated_at'] = new Date();
    await this.doctorRepository.replaceById(id, doctor);
  }

  // 🔹 DELETE
  @del('/doctors/{id}')
  @response(204, {description: 'Doctor DELETE success'})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.doctorRepository.deleteById(id);
  }

  @post('/doctor-leave')
  @response(200, {
    description: 'Doctor leave recorded successfully',
  })
  async applyLeave(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              doctorId: {type: 'number'},
              leaveDate: {type: 'string', format: 'date'},
              reason: {type: 'string'},
            },
            required: ['doctorId', 'leaveDate'],
          },
        },
      },
    })
    body: {doctorId: number; leaveDate: string; reason?: string},
  ) {
    const doctor = await this.doctorRepository.findById(body.doctorId);
    if (!doctor) throw new HttpErrors.NotFound('Doctor not found');

    // Save the leave record
    await this.doctorLeaveRepo.create({
      doctorId: body.doctorId,
      leaveDate: body.leaveDate,
      reason: body.reason ?? '',
    });

    // Find all appointments for that doctor on that leave date
    const appointments = await this.appointmentRepo.find({
      where: {
        and: [
          {doctorId: body.doctorId},
          {appointmentDate: body.leaveDate},
        ],
      },
    });

    // Parse available days from doctor record
    const availableDays = doctor.availableDays
      ? doctor.availableDays.split(',').map(d => d.trim().toLowerCase())
      : [];

    // Calculate next available date
    const nextAvailableDate = this.findNextAvailableDate(
      body.leaveDate,
      availableDays,
    );

    // Reschedule all appointments
    for (const appointment of appointments) {
      appointment.appointmentDate = nextAvailableDate;
      appointment.updatedAt = new Date().toISOString();
      appointment.appointmentStatus = 'Rescheduled (Doctor on leave)';
      await this.appointmentRepo.updateById(appointment.appointmentId, appointment);
    }

    return {
      message: `Leave recorded for ${doctor.firstName} on ${body.leaveDate}. ${appointments.length} appointment(s) rescheduled to ${nextAvailableDate}.`,
    };
  }

  /**
   * Helper function to find the next available date after leaveDate
   */
  private findNextAvailableDate(leaveDate: string, availableDays: string[]): string {
    const date = new Date(leaveDate);

    for (let i = 1; i <= 7; i++) {
      date.setDate(date.getDate() + 1);
      const weekday = date
        .toLocaleDateString('en-US', {weekday: 'long'})
        .toLowerCase()
        .slice(0, 3);
      if (availableDays.includes(weekday)) {
        return date.toISOString().split('T')[0];
      }
    }
    throw new HttpErrors.BadRequest('No available day found within next 7 days');
  }
}
