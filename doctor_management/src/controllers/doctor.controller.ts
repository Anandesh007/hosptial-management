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
  requestBody,
  response,
} from '@loopback/rest';
import {Doctor} from '../models';
import {DoctorRepository} from '../repositories';

export class DoctorController {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
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
}
