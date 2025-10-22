import {repository} from '@loopback/repository';
import {post, get, param, requestBody, response, HttpErrors} from '@loopback/rest';
import {Appointment} from '../models';
import {AppointmentRepository, DoctorRepository} from '../repositories';

export class AppointmentController {
  constructor(
    @repository(AppointmentRepository)
    public appointmentRepository: AppointmentRepository,
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
  ) {}

  // Create an appointment
  @post('/appointments')
  @response(200, {
    description: 'Appointment created successfully',
    content: {'application/json': {schema: {'x-ts-type': Appointment}}},
  })
  async createAppointment(
    @requestBody() appointmentData: Appointment,
  ): Promise<Appointment> {
    let doctor=null;

    if (!appointmentData.doctorName) {
      throw new HttpErrors.BadRequest('doctorName is required');
    }

    // Find doctor by name and optional specialization
     doctor = await this.doctorRepository.findOne({
      where: appointmentData.specialization
        ? {
            and: [
              {firstName: appointmentData.doctorName},
              {specialization: appointmentData.specialization},
            ],
          }
        : {firstName: appointmentData.doctorName},
    });

    if (!doctor) {
      throw new HttpErrors.NotFound(
        'No doctor found with the given name and specialization',
      );
    }

    // Check doctor's availability for the appointment day
    if (doctor.availableDays) {
      const availableDays = doctor.availableDays
        .split(',')
        .map(d => d.trim().toLowerCase());
      const appointmentDay = new Date(appointmentData.appointmentDate)
        .toLocaleDateString('en-US', {weekday: 'long'})
        .toLowerCase()
        .slice(0, 3);

      if (!availableDays.includes(appointmentDay)) {
        throw new HttpErrors.BadRequest(
          `Doctor ${doctor.firstName} is not available on ${appointmentDay}`,
        );
      }
    }

    // Check if doctor already has appointment on that date
    const existing = await this.appointmentRepository.findOne({
      where: {
        and: [
          {doctorId: doctor.doctorId},
          {appointmentDate: appointmentData.appointmentDate},
        ],
      },
    });

    // If doctor is busy, assign another doctor with same specialization
    if (existing) {
      const alternativeDoctor = await this.doctorRepository.findOne({
        where: {
          and: [
            {specialization: doctor.specialization},
            {doctorId: {neq: doctor.doctorId}},
          ],
        },
      });

      if (alternativeDoctor) {
        doctor = alternativeDoctor;
      } else {
        throw new HttpErrors.BadRequest(
          `All doctors with specialization "${doctor.specialization}" are busy on that date.`,
        );
      }
    }

    // Assign doctorId and timestamps
    appointmentData.createdAt = new Date().toISOString();
    appointmentData.updatedAt = new Date().toISOString();
    appointmentData.appointmentStatus = 'Scheduled';

    return this.appointmentRepository.create(appointmentData);
  }

  // Get all appointments
  @get('/appointments')
  @response(200, {
    description: 'Array of Appointment instances',
    content: {'application/json': {schema: {type: 'array', items: {'x-ts-type': Appointment}}}},
  })
  async find(): Promise<Appointment[]> {
    return this.appointmentRepository.find();
  }

  // Get appointment by ID
  @get('/appointments/{id}')
  @response(200, {
    description: 'Appointment by ID',
    content: {'application/json': {schema: {'x-ts-type': Appointment}}},
  })
  async findById(@param.path.number('id') id: number): Promise<Appointment> {
    return this.appointmentRepository.findById(id);
  }
}
