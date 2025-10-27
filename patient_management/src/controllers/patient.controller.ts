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
  RestBindings,
  requestBody,
  HttpErrors,
  response,
  Request
} from '@loopback/rest';
import {Patient} from '../models';
import {PatientRepository} from '../repositories';
import {inject} from '@loopback/core';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'myjwtsecret';

export class PatientController {
  constructor(
    @repository(PatientRepository)
    public patientRepository : PatientRepository,
    @inject(RestBindings.Http.REQUEST) private req: Request,
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
    this.verifyToken(['receptionist']);
    return this.patientRepository.create(patient);
  }

  // READ ALL
  @get('/patients')
  @response(200, {
    description: 'Array of Patient model instances',
    content: {'application/json': {schema: {type: 'array', items: getModelSchemaRef(Patient)}}},
  })
  async find(@param.filter(Patient) filter?: Filter<Patient>): Promise<Patient[]> {
    this.verifyToken(['receptionist','doctor']);
    return this.patientRepository.find(filter);
  }

  // READ BY ID
  @get('/patients/{id}')
  @response(200, {
    description: 'Patient model instance',
    content: {'application/json': {schema: getModelSchemaRef(Patient)}},
  })
  async findById(@param.path.number('id') id: number): Promise<Patient> {
    this.verifyToken(['receptionist','doctor']);
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
    this.verifyToken(['receptionist']);
    await this.patientRepository.updateById(id, patient);
  }

  // DELETE
  @del('/patients/{id}')
  @response(204, {
    description: 'Patient DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void>{
    this.verifyToken(['receptionist','admin']);
    await this.patientRepository.deleteById(id);
  }

   private verifyToken(requiredRoles: string[] = []) {
    const authHeader = this.req.headers.authorization;
    if (!authHeader) throw new HttpErrors.Unauthorized('No authorization header');
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new HttpErrors.Forbidden('Access denied for this role');
      }
      return decoded; // {id, email, role}
    } catch {
      throw new HttpErrors.Unauthorized('Invalid or expired token');
    }
  }
}
