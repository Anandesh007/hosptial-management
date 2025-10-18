import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Patient} from '../models';
import {PatientRepository} from '../repositories';

export class PatientController {
  constructor(
    @repository(PatientRepository)
    public patientRepository : PatientRepository,
  ) {}

  // CREATE
  @post('/patients')
  @response(200, {
    description: 'Patient model instance',
    content: {'application/json': {schema: getModelSchemaRef(Patient)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {exclude: ['patientId']}),
        },
      },
    })
    patient: Omit<Patient, 'patientId'>,
  ): Promise<Patient> {
    return this.patientRepository.create(patient);
  }

  // READ ALL
  @get('/patients')
  @response(200, {
    description: 'Array of Patient model instances',
    content: {'application/json': {schema: {type: 'array', items: getModelSchemaRef(Patient)}}},
  })
  async find(@param.filter(Patient) filter?: Filter<Patient>): Promise<Patient[]> {
    return this.patientRepository.find(filter);
  }

  // READ BY ID
  @get('/patients/{id}')
  @response(200, {
    description: 'Patient model instance',
    content: {'application/json': {schema: getModelSchemaRef(Patient)}},
  })
  async findById(@param.path.number('id') id: number): Promise<Patient> {
    return this.patientRepository.findById(id);
  }

  // UPDATE
  @patch('/patients/{id}')
  @response(204, {
    description: 'Patient PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() patient: Partial<Patient>,
  ): Promise<void> {
    await this.patientRepository.updateById(id, patient);
  }

  // DELETE
  @del('/patients/{id}')
  @response(204, {
    description: 'Patient DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientRepository.deleteById(id);
  }
}
