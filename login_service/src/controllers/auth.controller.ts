import {repository} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {compare, hash} from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import {User} from '../models';
import {DoctorRepository, UserRepository} from '../repositories';

const JWT_SECRET = process.env.JWT_SECRET || 'myjwtsecret';

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepo: UserRepository,
    @repository(DoctorRepository)
    public doctorRepo: DoctorRepository
  ) {}

  // -----------------------
  // 1. REGISTER
  // -----------------------
  @post('/auth/register')
  async register(
    @requestBody() userData: {username: string; email: string; password: string; role: string},
  ): Promise<any> {
    const existingUser = await this.userRepo.findOne({
      where: {email: userData.email},
    });
    if (existingUser) {
      throw new HttpErrors.BadRequest('Email already exists');
    }

    const hashedPassword = await hash(userData.password, 10);

    const savedUser = await this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });

    return {
      message: 'User registered successfully',
      user: {id: savedUser.id, name: savedUser.name, email: savedUser.email, role: savedUser.role},
    };
  }

  @post('/doctor/register')
  async doctorregister(
    @requestBody() userData: {username: string; email: string; password: string; role: string,firstName: string,lastName: string,specialization: string,contactNumber: string,availableDays: string},
  ): Promise<any> {
    const existingUser = await this.userRepo.findOne({
      where: {email: userData.email},
    });
    if (existingUser) {
      throw new HttpErrors.BadRequest('Email already exists');
    }

    const hashedPassword = await hash(userData.password, 10);

       const newUser = await this.userRepo.create({
      username: userData.username,
      password: hashedPassword,
      email:userData.email,
      role: 'doctor',
    });

      await this.doctorRepo.create({
      firstName: userData.firstName,
      lastName:userData.lastName,
      specialization:userData.specialization,
      contactNumber:userData.contactNumber,
      availableDays:userData.availableDays,
      email: userData.email,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()});

    return {message: 'Doctor registered successfully', userId: newUser.id};

  }
  
  @post('/auth/login')
  async login(
    @requestBody() credentials: {email: string; password: string},
  ): Promise<{token: string}> {
    const user = await this.userRepo.findOne({where: {email: credentials.email}});
    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    const passwordMatched = await compare(credentials.password, user.password);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    // Sign JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {expiresIn: '1h'},
    );

    return {token};
  }
}
