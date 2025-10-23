import {repository} from '@loopback/repository';
import {post, get, param, requestBody, response, patch, del,HttpErrors} from '@loopback/rest';
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

    // Count how many appointments the doctor already has that day
    const appointmentCount = await this.appointmentRepository.count({
      and: [
        {doctorId: doctor.doctorId},
        {appointmentDate: appointmentData.appointmentDate},
      ],
    });

    // If doctor already has 10 appointments, assign another doctor
    if (appointmentCount.count >= 10) {
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

  @get('/doctor/{doctorName}')
  @response(200, {
  description: 'Appointments for Doctor',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: {'x-ts-type': Appointment},
      },
    },
  },
})
async finddoctorname(
  @param.path.string('doctorName') doctorName: string,
): Promise<Appointment[]> {
  return this.appointmentRepository.find({
    where: {doctorName: doctorName},
  });
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

  @patch('/appointments/reschedule/{id}')
  @response(200, {
  description: 'Reschedule an existing appointment',
  content: {'application/json': {schema: {'x-ts-type': Appointment}}},
  })
  async rescheduleAppointment(
  @param.path.number('id') id: number,
  @requestBody({
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            newDate: {type: 'string', format: 'date'},
          },
          required: ['newDate'],
          },
        },
      },
    })
    requestBody: {newDate: string},
  ): Promise<Appointment> {
  // Find the existing appointment
  const appointment = await this.appointmentRepository.findById(id);
  if (!appointment) {
    throw new HttpErrors.NotFound('Appointment not found');
  }

  // Get the doctor details
  const doctor = await this.doctorRepository.findById(appointment.doctorId);
  if (!doctor) {
    throw new HttpErrors.NotFound('Doctor not found');
  }

  // Check if doctor is available on that day
  if (doctor.availableDays) {
    const availableDays = doctor.availableDays
      .split(',')
      .map(d => d.trim().toLowerCase());
    const newDay = new Date(requestBody.newDate)
      .toLocaleDateString('en-US', {weekday: 'long'})
      .toLowerCase()
      .slice(0, 3);

    if (!availableDays.includes(newDay)) {
      throw new HttpErrors.BadRequest(
        `Doctor ${doctor.firstName} is not available on ${newDay}`,
      );
    }
  }

  // Check doctor's current appointment count for that new date
  const count = await this.appointmentRepository.count({
    and: [
      {doctorId: doctor.doctorId},
      {appointmentDate: requestBody.newDate},
    ],
  });

  if (count.count >= 10) {
    throw new HttpErrors.BadRequest(
      `Doctor ${doctor.firstName} already has 10 appointments on ${requestBody.newDate}`,
    );
  }

  // Step 5️⃣: Update the appointment date
  appointment.appointmentDate = requestBody.newDate;
  appointment.updatedAt = new Date().toISOString();
  appointment.appointmentStatus = 'Rescheduled';

  await this.appointmentRepository.updateById(id, appointment);

  return appointment;
}

  //Cancel the appointment by appointmentid
  @del('/appointments/{id}')
  @response(204, {
    description: 'Appointment canceled successfully',
  })
  async cancelAppointment(
    @param.path.number('id') id: number,
  ): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new HttpErrors.NotFound('Appointment not found');
    }

    await this.appointmentRepository.deleteById(id);
  }
}

  


